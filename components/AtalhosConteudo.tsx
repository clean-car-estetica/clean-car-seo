import Link from "next/link";
import { Lightbulb, Users, MessageCircleQuestionMark, Newspaper, Sofa } from "lucide-react";

// Atalhos para as páginas de conteúdo (guias, blog, perguntas). Antes só
// existiam no rodapé; aqui ficam à vista na página inicial, antes do FAQ.
const ATALHOS = [
  { href: "/problemas", titulo: "Problemas e soluções", texto: "Cheiro ruim, mancha no banco, farol amarelado e mais.", Icone: Lightbulb },
  { href: "/para", titulo: "Para o seu dia a dia", texto: "Aplicativo, família com crianças, pets, venda do carro.", Icone: Users },
  { href: "/perguntas", titulo: "Pergunte para a Clean Car", texto: "Mande sua dúvida e a gente responde no site.", Icone: MessageCircleQuestionMark },
  { href: "/blog", titulo: "Blog", texto: "Dicas para manter o carro limpo por mais tempo.", Icone: Newspaper },
  { href: "/servicos/higienizacao-de-estofados", titulo: "Estofados a domicílio", texto: "Sofá e poltronas higienizados na sua casa.", Icone: Sofa },
];

export default function AtalhosConteudo() {
  return (
    <section aria-labelledby="atalhos-titulo" className="mx-auto max-w-6xl px-6 py-16">
      <h2 id="atalhos-titulo" className="font-display font-bold text-3xl md:text-4xl text-steel">
        Tire suas <span className="text-verniz-shine">dúvidas</span>
      </h2>
      <p className="mt-2 mb-8 text-steel-line max-w-xl">Respostas para os problemas mais comuns do carro, sem precisar perguntar.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {ATALHOS.map(({ href, titulo, texto, Icone }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl bg-card border border-card-line p-5 hover:border-verniz transition-colors"
          >
            <Icone size={22} className="text-verniz-shine" aria-hidden />
            <div className="mt-3 font-display font-bold text-steel group-hover:text-verniz-shine">{titulo}</div>
            <p className="mt-1 text-sm text-steel-line leading-snug">{texto}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
