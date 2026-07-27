"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function salvarTextos(formData: FormData) {
  const dados = {
    footerTagline: String(formData.get("footerTagline")),
    footerLojaLabel: String(formData.get("footerLojaLabel")),
    footerRecebemos: String(formData.get("footerRecebemos")),
    homeCidadesTitulo: String(formData.get("homeCidadesTitulo")),
    homeCidadesSubtitulo: String(formData.get("homeCidadesSubtitulo")),
    homeServicosTitulo: String(formData.get("homeServicosTitulo")),
    homeServicosSubtitulo: String(formData.get("homeServicosSubtitulo")),
    navServicos: String(formData.get("navServicos")),
    navPlanos: String(formData.get("navPlanos")),
    navFaq: String(formData.get("navFaq")),
    navIndicacao: String(formData.get("navIndicacao")),
    navBeneficios: String(formData.get("navBeneficios")),
    navContato: String(formData.get("navContato")),
    navBlog: String(formData.get("navBlog")),
    navBotaoAgendar: String(formData.get("navBotaoAgendar")),
    faqTitulo: String(formData.get("faqTitulo")),
    faqSubtitulo: String(formData.get("faqSubtitulo")),
    beneficiosTitulo: String(formData.get("beneficiosTitulo")),
    beneficiosSubtitulo: String(formData.get("beneficiosSubtitulo")),
    orcamentoTitulo: String(formData.get("orcamentoTitulo")),
    orcamentoSubtitulo: String(formData.get("orcamentoSubtitulo")),
    avaliarTitulo: String(formData.get("avaliarTitulo")),
    avaliarSubtitulo: String(formData.get("avaliarSubtitulo")),
    avaliarSucessoTitulo: String(formData.get("avaliarSucessoTitulo")),
    labelNome: String(formData.get("labelNome")),
    labelWhatsapp: String(formData.get("labelWhatsapp")),
  };
  const { error } = await supabaseAdmin
    .from("site_content")
    .upsert({ section: "textos", data: dados, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/textos");
}
