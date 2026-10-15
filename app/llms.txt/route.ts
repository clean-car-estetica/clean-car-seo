import { SITE_URL, filtrarLevaETraz, whatsappLink } from "@/lib/config";
import { getContatoContent } from "@/lib/site-content";
import { getServicosPublicos, getFaqsPublicos } from "@/lib/site-data";
import { getGuiasPublicadas, caminhoGuia } from "@/lib/guias";
import { SERVICOS_DOMICILIO } from "@/lib/data";
import { supabasePublico } from "@/lib/supabase";

// /llms.txt (15/10/2026): resumo do negócio em texto simples para assistentes
// de IA (ChatGPT, Gemini, Claude, Perplexity). Gerado do banco a cada leitura,
// então muda sozinho quando um serviço, preço ou guia muda no console.
// Os planos mensais ficam de fora até os preços novos serem cadastrados.
export const dynamic = "force-dynamic";

export async function GET() {
  const [contato, servicos, faqs, guias, posts] = await Promise.all([
    getContatoContent(),
    getServicosPublicos(),
    getFaqsPublicos(),
    getGuiasPublicadas(),
    supabasePublico
      .from("blog_posts")
      .select("slug, titulo, resumo")
      .eq("status", "publicado")
      .order("publicado_em", { ascending: false })
      .then((r) => (r.data ?? []) as { slug: string; titulo: string; resumo: string }[], () => []),
  ]);
  const limpa = (t: string) => filtrarLevaETraz(t, contato.levaETraz).replace(/\s+/g, " ").trim();
  const L: string[] = [];

  L.push("# Clean Car Estética Automotiva");
  L.push("");
  L.push(
    "> Estética automotiva em Mogi das Cruzes (SP), no bairro Jardim Universo. Lavagem detalhada, higienização interna, revitalização de plásticos, restauração de faróis, cristalização de vidros, hidratação de couro e higienização de estofados a domicílio. Produtos profissionais Vonixx, atendimento com hora marcada, avaliação gratuita e garantia de execução de 48 horas. Atende clientes de todo o Alto Tietê (Suzano, Poá, Ferraz de Vasconcelos, Itaquaquecetuba, Guararema)."
  );
  L.push("");
  L.push("## Contato e localização");
  L.push(`- Endereço: ${contato.endereco}`);
  L.push(`- WhatsApp (agendamento e orçamento): +${contato.whatsapp} — ${whatsappLink(contato)}`);
  L.push(`- Horário: ${contato.horarioSemana}; ${contato.horarioSabado}. Domingo fechado. ${contato.observacaoHorario}`.trim());
  L.push(`- Instagram: ${contato.instagramUrl}`);
  L.push(`- Google Maps e avaliações: ${contato.googleUrl}`);
  if (contato.formasPagamento) L.push(`- Pagamento: ${contato.formasPagamento}`);
  L.push(`- Leva e traz: ${contato.levaETraz ? "disponível, conforme o bairro" : "não disponível no momento (o cliente leva o carro até a loja)"}`);
  L.push("");
  L.push("## Serviços e preços");
  L.push("Valores de referência para carros de porte médio (hatch e sedan). SUV, picape e veículos grandes: acréscimo de 25% a 30% após avaliação.");
  for (const s of servicos) {
    const preco = s.preco_desde ? `a partir de R$ ${s.preco_desde}` : "valor sob avaliação gratuita pelas fotos";
    const local = SERVICOS_DOMICILIO.includes(s.slug) ? " Feito na casa do cliente." : "";
    L.push(`- [${s.nome}](${SITE_URL}/servicos/${s.slug}): ${preco}${s.duracao ? `, cerca de ${s.duracao}` : ""}. ${limpa(s.resumo)}${local}`);
  }
  L.push("");
  L.push("## O que a Clean Car não faz");
  L.push("- Polimento, vitrificação de pintura e lavagem de chassi não fazem parte dos serviços.");
  L.push("- Não faz diagnóstico mecânico: a lavagem de motor a seco deixa o motor limpo para o mecânico avaliar.");
  L.push("");
  L.push("## Regras");
  L.push("- Avaliação visual prévia gratuita, inclusive por foto no WhatsApp.");
  L.push("- Garantia: cobre falha de execução comunicada em até 48 horas; não cobre danos pré-existentes, desgaste natural ou uso inadequado.");
  L.push("- Tempo de serviço pode aumentar em veículos muito sujos.");
  L.push("");
  if (guias.length) {
    L.push("## Guias: problema e solução");
    for (const g of guias) L.push(`- [${g.titulo}](${SITE_URL}${caminhoGuia(g)}): ${limpa(g.meta_descricao || g.intro)}`);
    L.push("");
  }
  if (posts.length) {
    L.push("## Artigos");
    for (const p of posts) L.push(`- [${p.titulo}](${SITE_URL}/blog/${p.slug}): ${limpa(p.resumo)}`);
    L.push("");
  }
  if (faqs.length) {
    L.push("## Perguntas frequentes");
    for (const f of faqs) L.push(`- ${f.pergunta} — ${limpa(f.resposta)}`);
    L.push("");
  }
  L.push("## Páginas principais");
  L.push(`- [Tabela de preços](${SITE_URL}/precos)`);
  L.push(`- [Qual cuidado o seu carro precisa? (ferramenta)](${SITE_URL}/qual-cuidado)`);
  L.push(`- [Estética automotiva em Mogi das Cruzes](${SITE_URL}/mogi-das-cruzes)`);
  L.push(`- [Perguntas frequentes](${SITE_URL}/faq)`);
  L.push(`- [Pergunte para a Clean Car](${SITE_URL}/perguntas)`);
  L.push(`- [Sobre](${SITE_URL}/sobre)`);

  return new Response(L.join("\n") + "\n", {
    headers: { "content-type": "text/markdown; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=3600" },
  });
}
