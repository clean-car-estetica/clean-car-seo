import { Car, Droplets, SprayCan, ShieldCheck, Sparkles } from "lucide-react";

const PASSOS = [
  {
    icon: Car,
    titulo: "Você escolhe como entregar",
    texto: "Traz o carro até o estúdio ou contrata o leva-e-trás — buscamos e devolvemos onde for melhor pra você.",
  },
  {
    icon: Droplets,
    titulo: "Pré-lavagem técnica",
    texto: "Soltamos a sujeira mais grossa antes de qualquer contato direto na pintura, reduzindo o risco de microrriscos.",
  },
  {
    icon: SprayCan,
    titulo: "Shampoo neutro + luvas próprias",
    texto: "Aplicação com luvas específicas para lavagem automotiva — o cuidado que protege o verniz do seu carro.",
  },
  {
    icon: ShieldCheck,
    titulo: "Higienização com sanitizante",
    texto: "Limpeza interna que cuida da saúde de quem dirige, não só da aparência do carro.",
  },
  {
    icon: Sparkles,
    titulo: "Produtos Vonixx do início ao fim",
    texto: "Química de ponta em cada etapa, do básico ao polimento e vitrificação.",
  },
];

export default function Processo() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-steel">
          Não é só uma lavagem. <span className="text-verniz-shine">É um processo.</span>
        </h2>
        <p className="mt-2 text-steel-line max-w-xl mx-auto">
          Cada carro que entra na Clean Car passa pelas mesmas etapas técnicas, sempre.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {PASSOS.map((p, i) => (
          <div key={i} className="bg-card border border-card-line rounded-2xl p-5">
            <div className="w-10 h-10 rounded-full bg-verniz/10 flex items-center justify-center mb-4">
              <p.icon size={20} className="text-verniz-shine" />
            </div>
            <h3 className="font-display font-bold text-steel mb-2">{p.titulo}</h3>
            <p className="text-sm text-steel-line leading-relaxed">{p.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
