import type { Metadata } from "next";
import { t } from "@/content";
import { getClinic } from "@/lib/data";
import { PageHero } from "@/components/shared/page-hero";
import { Prose } from "@/components/shared/prose";
import { Section } from "@/components/shared/section";

export const metadata: Metadata = {
  title: t.footer.privacy,
  alternates: { canonical: "/politica-de-privacidade" },
};

/**
 * TEMPLATE — must be reviewed by the clinic's data protection adviser / lawyer
 * before publication. Placeholders in [brackets] must be completed.
 */
export default async function PrivacyPage() {
  const clinic = await getClinic();
  const retentionMonths = Math.round(clinic.retentionDays / 30);
  return (
    <>
      <PageHero
        compact
        eyebrow="Privacidade"
        title={t.footer.privacy}
        intro="Explicamos, de forma simples, que dados recolhemos neste site, para quê e durante quanto tempo."
      />
      <Section fill={false}>
          <Prose>
            <p className="surface-tint p-4 text-sm">
              <strong>Nota:</strong> este texto é um modelo inicial e deve ser revisto e completado pelo responsável
              pelo tratamento antes da publicação do site.
            </p>

            <h2>1. Responsável pelo tratamento</h2>
            <p>
              {clinic.name}, com sede em {clinic.addressLine1}, {clinic.postalCode} {clinic.city}, NIF [a completar].
              Contacto para questões de privacidade: <a href={`mailto:${clinic.email}`}>{clinic.email}</a>.
            </p>

            <h2>2. Que dados recolhemos</h2>
            <p>Quando faz um pedido de marcação neste site, recolhemos apenas:</p>
            <ul>
              <li>nome;</li>
              <li>número de telemóvel;</li>
              <li>email (opcional);</li>
              <li>o serviço, o profissional (se escolher) e a data e hora preferidas;</li>
              <li>a data em que deu o seu consentimento.</li>
            </ul>
            <p>
              <strong>Não pedimos</strong> o motivo da consulta, sintomas, diagnósticos ou qualquer outra informação de
              saúde através do site. Pedimos-lhe que não partilhe esse tipo de informação por formulário, email ou
              WhatsApp — falaremos sobre isso em consulta, num contexto adequado.
            </p>

            <h2>3. Para que usamos os dados</h2>
            <p>
              Exclusivamente para gerir o seu pedido de marcação: contactá-lo para confirmar, reagendar ou cancelar a
              consulta. Não usamos estes dados para marketing nem os vendemos ou cedemos a terceiros.
            </p>
            <p>
              Fundamento jurídico: diligências pré-contratuais a pedido do titular (art. 6.º, n.º 1, al. b) do RGPD) e o
              seu consentimento (art. 6.º, n.º 1, al. a)). [Confirmar com o encarregado de proteção de dados.]
            </p>

            <h2>4. WhatsApp</h2>
            <p>
              Se optar por nos contactar pelo WhatsApp, a conversa é tratada pela WhatsApp (Meta), de acordo com a
              política de privacidade dessa plataforma. A mensagem pré-preenchida contém apenas o serviço, o
              profissional e a data/hora preferidas.
            </p>

            <h2>5. Durante quanto tempo guardamos os dados</h2>
            <p>
              Os pedidos de marcação são conservados no máximo durante cerca de {retentionMonths} meses e depois
              eliminados. Pedidos recusados ou cancelados podem ser eliminados mais cedo.
            </p>

            <h2>6. Segurança</h2>
            <p>
              Os dados são transmitidos de forma cifrada (HTTPS) e só são acessíveis a membros autorizados da equipa,
              através de uma área de administração protegida.
            </p>

            <h2>7. Cookies e mapas</h2>
            <p>
              Este site não usa cookies de publicidade nem de análise. O mapa do Google só é carregado se clicar em
              “Mostrar mapa”; nesse momento, a Google poderá tratar dados de acordo com a sua política de privacidade.
            </p>

            <h2>8. Os seus direitos</h2>
            <p>
              Pode pedir o acesso, a retificação, a eliminação ou a limitação do tratamento dos seus dados, opor-se ao
              tratamento e retirar o consentimento a qualquer momento, através de{" "}
              <a href={`mailto:${clinic.email}`}>{clinic.email}</a>. Tem ainda o direito de apresentar reclamação à
              Comissão Nacional de Proteção de Dados (<a href="https://www.cnpd.pt/" target="_blank" rel="noopener noreferrer">www.cnpd.pt</a>).
            </p>
          </Prose>
      </Section>
    </>
  );
}
