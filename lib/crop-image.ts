// Gera um Blob da área recortada de uma imagem, a partir da área retornada pelo react-easy-crop.
export type AreaPixels = { x: number; y: number; width: number; height: number };

function carregarImagem(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function gerarImagemRecortada(
  imagemUrl: string,
  area: AreaPixels,
  larguraSaida = 1200
): Promise<Blob> {
  const imagem = await carregarImagem(imagemUrl);
  const escala = larguraSaida / area.width;

  const canvas = document.createElement("canvas");
  canvas.width = larguraSaida;
  canvas.height = Math.round(area.height * escala);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível preparar o recorte.");

  ctx.drawImage(
    imagem,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar a imagem recortada."))),
      "image/jpeg",
      0.9
    );
  });
}
