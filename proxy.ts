import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SERVICOS_PAUSADOS } from "@/lib/data";

// Serviços que a Clean Car NÃO faz. Qualquer endereço com eles (inclusive
// cidade/bairro) responde 410 "Gone": é o jeito mais rápido de o Google tirar
// a página do índice e parar de acusar erro. Antes eles redirecionavam 301
// para serviços diferentes (chassi → Lavagem Ouro, polimento → Enceramento),
// o que o Google trata como "soft 404" e mantém reclamando no Search Console.
const SERVICOS_REMOVIDOS = [
  "lavagem-chassi",
  "lavagem-de-chassi",
  "polimento",
  "polimento-tecnico",
  "vitrificacao",
  "vitrificacao-de-pintura",
  // 16/10/2026: saiu do catálogo (a proteção de verdade exige desmontar as
  // rodas). No lugar entra a Lavagem Pesada de Rodas, em outro endereço.
  "protecao-de-rodas",
];
const RE_REMOVIDO = new RegExp(`^/servicos/(${SERVICOS_REMOVIDOS.join("|")})(/|$)`);

// Serviços PAUSADOS (lista em lib/data.ts): redirecionamento TEMPORÁRIO (307)
// para a tabela de preços, sem dizer ao Google que a página acabou.
const RE_PAUSADO = new RegExp(`^/servicos/(${SERVICOS_PAUSADOS.join("|")})(/|$)`);

const PAGINA_410 = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Serviço indisponível | Clean Car</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#03071e;color:#e6edf3;font-family:system-ui,sans-serif;padding:24px;text-align:center}a{color:#6fd0e3}</style></head><body><main><h1>Este serviço não faz parte do nosso catálogo</h1><p>Veja os serviços que a Clean Car Estética Automotiva oferece em Mogi das Cruzes.</p><p><a href="/#servicos">Ver serviços e preços</a></p></main></body></html>`;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (RE_REMOVIDO.test(pathname)) {
    return new NextResponse(PAGINA_410, {
      status: 410,
      headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" },
    });
  }

  if (RE_PAUSADO.test(pathname)) {
    return NextResponse.redirect(new URL("/precos", request.url), 307);
  }

  // Daqui pra baixo: só o painel (/admin). As páginas públicas não passam
  // mais pela checagem de login — antes cada visita do Google esperava uma
  // consulta ao Supabase Auth, deixando o site mais lento para rastrear.
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // 20/10/2026: getClaims confere o login pela assinatura do token, sem ir ao
  // servidor do Supabase a cada clique (getUser fazia uma ida e volta por
  // página aberta e por pré-carregamento de link, e o admin ficava lento).
  // Quando o token vence, ele renova a sessão como antes.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims?.sub ? data.claims : null;

  const isLoginPage = pathname === "/admin/login";

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/servicos/:path*"],
};
