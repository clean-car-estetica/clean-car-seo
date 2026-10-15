import { metadataGuia, PaginaGuiaPublica } from "@/components/GuiaRota";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return metadataGuia("problema", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PaginaGuiaPublica tipo="problema" slug={slug} />;
}
