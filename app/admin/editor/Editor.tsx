"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Monitor, Smartphone, RotateCw, ExternalLink, X, MousePointerClick, Settings2, ChevronRight } from "lucide-react";
import { BLOCOS, AJUSTES_GERAIS } from "@/lib/editor-blocos";

type Item = { slug: string; nome: string };
type BlocoNaPagina = { id: string; ancora?: string };
type Painel = { rotulo: string; dica: string; url: string; id?: string; ancora?: string } | null;

const PAGINAS_FIXAS = [
  { caminho: "/", nome: "Página inicial" },
  { caminho: "/sobre", nome: "Sobre nós" },
  { caminho: "/contato", nome: "Contato" },
  { caminho: "/faq", nome: "Perguntas frequentes" },
  { caminho: "/blog", nome: "Blog" },
  { caminho: "/beneficios", nome: "Benefícios" },
];

function urlDoPainel(id: string, ancora?: string): string {
  const b = BLOCOS[id];
  if (!b) return "/admin";
  if (id === "servico" && ancora) return `${b.caminho}?embed=1#servico-${ancora}`;
  if (id === "pagina-local" && ancora) {
    const [servico, cidade] = ancora.split("/");
    return `${b.caminho}?embed=1&servico=${servico}&cidade=${cidade}`;
  }
  return `${b.caminho}?embed=1`;
}

export default function Editor({ servicos, cidades }: { servicos: Item[]; cidades: Item[] }) {
  const previa = useRef<HTMLIFrameElement>(null);
  const [caminho, setCaminho] = useState("/");
  const [alvo, setAlvo] = useState("/");
  const [versao, setVersao] = useState(0);
  const [aparelho, setAparelho] = useState<"computador" | "celular">("computador");
  const [blocos, setBlocos] = useState<BlocoNaPagina[]>([]);
  const [tituloPagina, setTituloPagina] = useState("");
  const [painel, setPainel] = useState<Painel>(null);
  const [salvo, setSalvo] = useState(false);
  const [servicoSel, setServicoSel] = useState("");
  const [cidadeSel, setCidadeSel] = useState("");

  const abrir = useCallback((id: string, ancora?: string) => {
    const b = BLOCOS[id];
    if (!b) return;
    setPainel({ rotulo: b.rotulo, dica: b.dica, url: urlDoPainel(id, ancora), id, ancora });
    previa.current?.contentWindow?.postMessage({ origem: "cc-editor", tipo: "destacar", id, ancora }, window.location.origin);
  }, []);

  const recarregar = useCallback(() => {
    // Sem trocar a URL: recarrega a prévia na mesma página e posição
    try {
      previa.current?.contentWindow?.location.reload();
    } catch {
      setVersao((v) => v + 1);
    }
  }, []);

  useEffect(() => {
    const aoReceber = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data;
      if (d?.origem === "cc-previa" && d.tipo === "pagina") {
        setCaminho(d.caminho);
        setBlocos(d.blocos ?? []);
        setTituloPagina(String(d.titulo ?? "").split("|")[0].trim());
      }
      if (d?.origem === "cc-previa" && d.tipo === "editar") abrir(d.id, d.ancora);
      if (d?.origem === "cc-painel" && d.tipo === "salvo") {
        setSalvo(true);
        recarregar();
        setTimeout(() => setSalvo(false), 2500);
      }
    };
    window.addEventListener("message", aoReceber);
    return () => window.removeEventListener("message", aoReceber);
  }, [abrir, recarregar]);

  function irPara(novo: string) {
    setCaminho(novo);
    setAlvo(novo);
    setPainel(null);
    setVersao((v) => v + 1);
  }

  const srcPrevia = `${alvo}${alvo.includes("?") ? "&" : "?"}editar=1&v=${versao}`;

  return (
    <div className="h-screen flex flex-col bg-carbon text-steel">
      {/* Barra superior */}
      <header className="shrink-0 flex flex-wrap items-center gap-2 px-3 py-2 border-b border-card-line bg-carbon-soft">
        <Link href="/admin" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-steel-line hover:text-steel hover:bg-card">
          <ArrowLeft size={16} /> Painel
        </Link>
        <span className="hidden sm:block w-px h-6 bg-card-line" />

        <label className="sr-only" htmlFor="ed-pagina">Página</label>
        <select
          id="ed-pagina"
          value={PAGINAS_FIXAS.some((p) => p.caminho === caminho) ? caminho : ""}
          onChange={(e) => e.target.value && irPara(e.target.value)}
          className="px-3 py-2 rounded-lg bg-card border border-card-line text-sm text-steel"
        >
          <option value="">Outra página…</option>
          {PAGINAS_FIXAS.map((p) => (
            <option key={p.caminho} value={p.caminho}>{p.nome}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="ed-servico">Serviço</label>
        <select
          id="ed-servico"
          value={servicoSel}
          onChange={(e) => {
            setServicoSel(e.target.value);
            if (e.target.value) irPara(`/servicos/${e.target.value}${cidadeSel ? `/${cidadeSel}` : ""}`);
          }}
          className="px-3 py-2 rounded-lg bg-card border border-card-line text-sm text-steel max-w-[12rem]"
        >
          <option value="">Página de serviço…</option>
          {servicos.map((s) => (
            <option key={s.slug} value={s.slug}>{s.nome}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="ed-cidade">Cidade</label>
        <select
          id="ed-cidade"
          value={cidadeSel}
          onChange={(e) => {
            setCidadeSel(e.target.value);
            if (servicoSel) irPara(`/servicos/${servicoSel}${e.target.value ? `/${e.target.value}` : ""}`);
          }}
          disabled={!servicoSel}
          className="px-3 py-2 rounded-lg bg-card border border-card-line text-sm text-steel disabled:opacity-40 max-w-[10rem]"
        >
          <option value="">Sem cidade</option>
          {cidades.map((c) => (
            <option key={c.slug} value={c.slug}>{c.nome}</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-1">
          {salvo && <span className="text-xs font-bold text-verniz-shine mr-2">Salvo · prévia atualizada</span>}
          <div className="flex rounded-lg border border-card-line overflow-hidden" role="group" aria-label="Tamanho da prévia">
            <button
              type="button"
              onClick={() => setAparelho("computador")}
              aria-pressed={aparelho === "computador"}
              className={`p-2 ${aparelho === "computador" ? "bg-verniz/15 text-verniz-shine" : "text-steel-line hover:text-steel"}`}
              title="Ver como computador"
            >
              <Monitor size={18} />
            </button>
            <button
              type="button"
              onClick={() => setAparelho("celular")}
              aria-pressed={aparelho === "celular"}
              className={`p-2 ${aparelho === "celular" ? "bg-verniz/15 text-verniz-shine" : "text-steel-line hover:text-steel"}`}
              title="Ver como celular"
            >
              <Smartphone size={18} />
            </button>
          </div>
          <button type="button" onClick={recarregar} className="p-2 rounded-lg text-steel-line hover:text-steel hover:bg-card" title="Atualizar prévia">
            <RotateCw size={18} />
          </button>
          <a href={caminho} target="_blank" rel="noreferrer" className="p-2 rounded-lg text-steel-line hover:text-steel hover:bg-card" title="Abrir esta página no site">
            <ExternalLink size={18} />
          </a>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex">
        {/* Prévia */}
        <div className="flex-1 min-w-0 bg-[color-mix(in_srgb,var(--carbon)_70%,black)] flex justify-center overflow-hidden">
          <iframe
            ref={previa}
            name="cc-previa"
            key={versao}
            src={srcPrevia}
            title="Prévia do site"
            className={`h-full bg-carbon transition-[width] duration-300 ${aparelho === "celular" ? "w-[390px] border-x border-card-line" : "w-full"}`}
          />
        </div>

        {/* Painel lateral */}
        <aside className={`${painel ? "fixed inset-0 z-50 flex md:static" : "hidden md:flex"} md:w-[440px] shrink-0 border-l border-card-line bg-carbon-soft flex-col`}>
          {painel ? (
            <>
              <div className="shrink-0 flex items-start gap-3 px-4 py-3 border-b border-card-line">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-verniz-shine">Editando</p>
                  <h2 className="font-display font-bold text-lg leading-tight">{painel.rotulo}</h2>
                  <p className="text-xs text-steel-line mt-0.5">{painel.dica}</p>
                </div>
                <button type="button" onClick={() => setPainel(null)} className="p-1.5 rounded-lg text-steel-line hover:text-steel hover:bg-card" aria-label="Fechar edição">
                  <X size={18} />
                </button>
              </div>
              <iframe key={painel.url} name="cc-embed" src={painel.url} title={`Editar ${painel.rotulo}`} className="flex-1 w-full bg-carbon" />
              <p className="shrink-0 px-4 py-2 text-[11px] text-steel-line border-t border-card-line">
                Ao salvar, a prévia ao lado atualiza sozinha.
              </p>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-5 grid content-start gap-6">
              <div className="flex gap-3 items-start">
                <MousePointerClick className="text-verniz-shine shrink-0 mt-0.5" size={22} />
                <div>
                  <h2 className="font-display font-bold text-lg leading-tight">Clique no que quer mudar</h2>
                  <p className="text-sm text-steel-line mt-1">
                    Passe o mouse na prévia: cada parte editável ganha um contorno. Clique e a edição abre aqui.
                  </p>
                </div>
              </div>

              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-steel-line mb-2">
                  Nesta página {tituloPagina && <span className="normal-case tracking-normal font-normal">· {tituloPagina}</span>}
                </h3>
                {blocos.length === 0 ? (
                  <p className="text-sm text-steel-line">Carregando a página…</p>
                ) : (
                  <ul className="grid gap-1">
                    {blocos.map((b) => {
                      const info = BLOCOS[b.id];
                      if (!info) return null;
                      return (
                        <li key={b.id + (b.ancora ?? "")}>
                          <button
                            type="button"
                            onClick={() => abrir(b.id, b.ancora)}
                            className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-lg hover:bg-card group"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-bold text-steel group-hover:text-verniz-shine">{info.rotulo}</span>
                              <span className="block text-xs text-steel-line truncate">{info.dica}</span>
                            </span>
                            <ChevronRight size={16} className="text-steel-line" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {AJUSTES_GERAIS.map((g) => (
                <section key={g.grupo}>
                  <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-steel-line mb-2">
                    <Settings2 size={13} /> {g.grupo}
                  </h3>
                  <ul className="grid gap-1">
                    {g.itens.map((a) => (
                      <li key={a.caminho}>
                        <button
                          type="button"
                          onClick={() => setPainel({ rotulo: a.rotulo, dica: a.dica, url: `${a.caminho}?embed=1` })}
                          className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-lg hover:bg-card group"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-steel group-hover:text-verniz-shine">{a.rotulo}</span>
                            <span className="block text-xs text-steel-line truncate">{a.dica}</span>
                          </span>
                          <ChevronRight size={16} className="text-steel-line" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
