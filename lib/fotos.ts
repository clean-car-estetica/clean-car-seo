// Fotos de banco escolhidas para mostrar o serviço de verdade (07/10/2026).
// Pexels: uso gratuito, inclusive comercial, sem atribuição obrigatória.
// Enquanto não houver fotos reais da Clean Car, estas substituem as fotos
// antigas do Unsplash que não tinham a ver com o serviço. Foto enviada pelo
// painel (/admin) continua tendo prioridade — só a do Unsplash é trocada.

const pexels = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const FOTO_SERVICO: Record<string, string> = {
  "lavagem-bronze": pexels(6872591), // espuma (snow foam) sendo aplicada com mangueira
  "lavagem-prata": pexels(6873174), // carro coberto de espuma na lavagem detalhada
  "lavagem-ouro": pexels(6872572), // mão com microfibra em pintura preta brilhando
  "higienizacao": pexels(5233285), // extratora/aspirador tirando manchas do banco de tecido
  "higienizacao-banco-dianteiro": pexels(31389821), // limpeza do interior com pano, detalhamento
  "higienizacao-banco-traseiro": "", // sem foto até o Glauber enviar uma real pelo painel
  "revitalizacao-plastico": pexels(31390691), // acabamento interno sendo limpo e tratado
  "restauracao-de-farol": pexels(5233268), // farol sendo polido com máquina
  "lavagem-motor": pexels(24819303), // cofre do motor limpo
  "cristalizacao-de-vidros": pexels(10961473), // gotas de chuva no para-brisa
  "hidratacao-de-couro": pexels(17339319), // bancos de couro em close
  "tratamento-anti-odor": "", // sem foto até o Glauber enviar uma real pelo painel
  "protecao-de-rodas": pexels(32667420), // roda brilhando com gotas d'água
  "enceramento-tecnico": pexels(11139244), // politriz espalhando a cera, brilho espelhado
};

export const FOTO_HERO = pexels(6872609, 1600); // carro preto recebendo espuma na loja
export const FOTO_PADRAO = pexels(6872591, 800);

const ehFotoAntiga = (url?: string | null) => !url || /images\.unsplash\.com/.test(url);

/** Foto do serviço: a do painel se for real; senão a escolhida aqui. */
export function fotoServico(slug: string, url?: string | null): string {
  if (!ehFotoAntiga(url)) return url as string;
  return FOTO_SERVICO[slug] ?? FOTO_PADRAO;
}

/** Foto do topo da página inicial. */
export function fotoHero(url?: string | null): string {
  return ehFotoAntiga(url) ? FOTO_HERO : (url as string);
}

// Vídeos do topo (Pexels, uso livre). Computador: horizontal; celular: vertical.
export const VIDEO_HERO = "https://videos.pexels.com/video-files/6873500/6873500-hd_1280_720_25fps.mp4";
export const VIDEO_HERO_CELULAR = "https://videos.pexels.com/video-files/32010548/13643197_1080_1920_30fps.mp4";
export const POSTER_HERO = "https://images.pexels.com/videos/6873500/pexels-photo-6873500.jpeg?auto=compress&cs=tinysrgb&w=1600";
