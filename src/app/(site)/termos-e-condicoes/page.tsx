import type { Metadata } from "next";
import { siteConfig } from "@/config/clinic";
import { t } from "@/content";
import { getClinic } from "@/lib/data";
import { PageHero } from "@/components/shared/page-hero";
import { Prose } from "@/components/shared/prose";
import { Section } from "@/components/shared/section";

export const metadata: Metadata = {
  title: t.footer.terms,
  alternates: { canonical: "/termos-e-condicoes" },
};

/** TEMPLATE — review with a legal adviser before publication. */
export default async function TermsPage() {
  const clinic = await getClinic();
  return (
    <>
      <PageHero compact eyebrow="Informação legal" title={t.footer.terms} />
      <Section fill={false}>
          <Prose>
            <p className="surface-tint p-4 text-sm">
              <strong>Nota:</strong> modelo inicial — rever antes da publicação.
            </p>
            <h2>Pedidos de marcação</h2>
            <p>
              Os pedidos feitos através deste site ou do WhatsApp são <strong>pedidos</strong> e não marcações
              confirmadas. A consulta só fica marcada depois de a nossa equipa confirmar consigo o dia e a hora.
            </p>
            <h2>Alterações e cancelamentos</h2>
            <p>
              Pedimos que nos avise com pelo menos 24 horas de antecedência caso precise de alterar ou cancelar uma
              consulta, por telefone ({clinic.phone}), email ({clinic.email}) ou WhatsApp.
            </p>
            <h2>Situações de urgência</h2>
            <p>
              Este site não se destina a situações de urgência. Em caso de emergência ligue 112. Para aconselhamento
              em saúde contacte a linha SNS 24 (808 24 24 24).
            </p>
            <h2>Livro de Reclamações</h2>
            <p>
              Dispomos de Livro de Reclamações físico e eletrónico, disponível em{" "}
              <a href={siteConfig.complaintsBookUrl} target="_blank" rel="noopener noreferrer">
                livroreclamacoes.pt
              </a>
              .
            </p>
          </Prose>
      </Section>
    </>
  );
}
