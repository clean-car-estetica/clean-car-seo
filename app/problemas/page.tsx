import GuiasIndice, { metadataIndice } from "@/components/GuiasIndice";

export const revalidate = 300;

export function generateMetadata() {
  return metadataIndice("problema");
}

export default function Page() {
  return <GuiasIndice tipo="problema" />;
}
