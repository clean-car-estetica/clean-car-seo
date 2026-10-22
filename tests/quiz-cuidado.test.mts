// Teste "Qual cuidado" (22/10/2026). Rodar: npx tsx tests/quiz-cuidado.test.mts
import { recomendar, alternarProblema, extrasNecessarios, type ProblemaId, type Extras } from "../lib/quiz-cuidado.ts";

let ok = 0, falhas = 0;
const t = (nome: string, c: boolean) => { if (c) ok++; else { falhas++; console.log("FALHOU:", nome); } };
const slugs = (p: ProblemaId[], e: Extras = {}, v: "medio" | "grande" | "moto" = "medio") => recomendar(v, p, e).itens.map((i) => `${i.slug}${i.qtd > 1 ? "x" + i.qtd : ""}`).join(" + ");

// Exemplos do Glauber
t("sujo por fora → Bronze", slugs(["sujo_fora"]) === "lavagem-bronze");
t("sujo por fora e por dentro (recente) → Prata", slugs(["sujo_tudo"], { ultima: "recente" }) === "lavagem-prata");
t("sujo por fora e por dentro (faz tempo) → Ouro", slugs(["sujo_tudo"], { ultima: "muito" }) === "lavagem-ouro");
t("cheiro leve → ozônio + Prata (ozônio é feito junto com lavagem)", slugs(["cheiro"], { cheiro: "leve" }) === "lavagem-prata + tratamento-anti-odor");
t("cheiro forte → Higienização VIP + ozônio", slugs(["cheiro"], { cheiro: "forte" }) === "higienizacao + tratamento-anti-odor");
t("plástico de fora → revitalização externa", slugs(["plastico_fora"]) === "revitalizacao-plastico-externo");
t("plástico de dentro → revitalização interna", slugs(["plastico_dentro"]) === "revitalizacao-plastico");
const venda = recomendar("medio", ["vender"]);
t("vou vender → Ouro, sugerindo farol, plástico e enceramento", venda.itens.map((i) => i.slug).join() === "lavagem-ouro" && venda.tambem.join() === "restauracao-de-farol,revitalizacao-plastico-externo,enceramento-tecnico");
t("um banco → 1 banco dianteiro", slugs(["banco"], { bancos: "um" }) === "higienizacao-banco-dianteiro");
t("dois da frente → banco dianteiro x2", slugs(["banco"], { bancos: "dois" }) === "higienizacao-banco-dianteirox2");
t("só o de trás → banco traseiro", slugs(["banco"], { bancos: "tras" }) === "higienizacao-banco-traseiro");
const todos = recomendar("medio", ["banco"], { bancos: "todos" });
t("frente e trás → VIP com alternativa só bancos", todos.itens[0].slug === "higienizacao" && todos.alternativa?.itens.length === 2);

// Combinações
t("sujo por fora + vidro → Bronze + cristalização (sem lavagem extra)", slugs(["sujo_fora", "vidro"]) === "lavagem-bronze + cristalizacao-de-vidros");
t("só vidro → inclui a Bronze (complementar)", slugs(["vidro"]) === "lavagem-bronze + cristalizacao-de-vidros");
t("só motor → inclui a Bronze", slugs(["motor"]) === "lavagem-bronze + lavagem-motor");
t("sujo por fora + pintura sem brilho → vira Prata (enceramento pede Prata ou Ouro)", slugs(["sujo_fora", "brilho"]) === "lavagem-prata + enceramento-tecnico");
t("sujo tudo (recente) + vender → fica só a Ouro", slugs(["sujo_tudo", "vender"], { ultima: "recente" }) === "lavagem-ouro");
t("encardido + banco → só a VIP (cobre os bancos)", slugs(["encardido", "banco"], { bancos: "dois" }) === "higienizacao");
t("encardido + cheiro leve → VIP + ozônio, sem lavagem extra", slugs(["encardido", "cheiro"], { cheiro: "leve" }) === "higienizacao + tratamento-anti-odor");
t("sujo tudo + banco manchado + farol", slugs(["sujo_tudo", "banco", "farol"], { ultima: "recente", bancos: "um" }) === "lavagem-prata + higienizacao-banco-dianteiro + restauracao-de-farol");
t("pelo → Ouro (aspiração premium)", slugs(["pelo"]) === "lavagem-ouro");
t("sofá → estofados a domicílio, sem lavagem", slugs(["sofa"]) === "higienizacao-de-estofados");
t("vender + farol marcado: farol sai das sugestões e entra na lista", (() => { const r = recomendar("medio", ["vender", "farol"]); return r.itens.some((i) => i.slug === "restauracao-de-farol") && !r.tambem.includes("restauracao-de-farol"); })());
t("todo item tem motivo", recomendar("medio", ["sujo_tudo", "cheiro", "vidro", "brilho", "rodas"], { ultima: "muito", cheiro: "forte" }).itens.every((i) => i.motivo.length > 20));

// Moto
t("moto suja → Prata Moto", slugs(["moto_suja"], {}, "moto") === "lavagem-prata-moto");
t("moto com graxa → Ouro Moto", slugs(["moto_detalhe"], {}, "moto") === "lavagem-ouro-moto");

// Marcação e perguntas extras
t("marcar 'por fora' desmarca 'por fora e por dentro'", alternarProblema(["sujo_tudo", "farol"], "sujo_fora").join() === "farol,sujo_fora");
t("desmarcar", alternarProblema(["farol"], "farol").length === 0);
t("pergunta extra só quando precisa", extrasNecessarios(["farol"]).length === 0 && extrasNecessarios(["banco", "cheiro"]).map((p) => p.chave).join() === "bancos,cheiro");

console.log(`\n${ok} passaram, ${falhas} falharam`);
process.exit(falhas ? 1 : 0);
