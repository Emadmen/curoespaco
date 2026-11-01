"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveSettings, type FormState } from "@/app/admin/(panel)/actions";
import type { ClinicInfo } from "@/types";
import { AdminField, FormMessage, SaveButton, checkboxClass, inputClass, submitWithoutReset, textareaClass } from "./form-bits";

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="surface p-5 sm:p-7">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export function SettingsForm({ clinic }: { clinic: ClinicInfo }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSettings, {});
  const hoursError = Object.entries(state.errors ?? {}).find(([k]) => k.startsWith("openingHours"))?.[1]?.[0];

  return (
    <form onSubmit={submitWithoutReset(action)} className="space-y-6">
      <FormMessage state={state} />

      <Section title="Clínica">
        <div className="grid gap-5 sm:grid-cols-2">
          <AdminField name="name" label="Nome da clínica" state={state}>
            <Input id="name" name="name" defaultValue={clinic.name} className={inputClass} />
          </AdminField>
          <AdminField name="tagline" label="Subtítulo" state={state}>
            <Input id="tagline" name="tagline" defaultValue={clinic.tagline} className={inputClass} />
          </AdminField>
        </div>
      </Section>

      <Section title="Contactos">
        <div className="grid gap-5 sm:grid-cols-2">
          <AdminField name="phone" label="Telefone" state={state}>
            <Input id="phone" name="phone" defaultValue={clinic.phone} className={inputClass} />
          </AdminField>
          <AdminField name="whatsapp" label="WhatsApp" hint="Formato internacional, sem +. Ex.: 351912345678" state={state}>
            <Input id="whatsapp" name="whatsapp" defaultValue={clinic.whatsapp} inputMode="tel" className={inputClass} />
          </AdminField>
          <AdminField name="email" label="Email" state={state}>
            <Input id="email" name="email" type="email" defaultValue={clinic.email} className={inputClass} />
          </AdminField>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <AdminField name="addressLine1" label="Morada" state={state}>
            <Input id="addressLine1" name="addressLine1" defaultValue={clinic.addressLine1} className={inputClass} />
          </AdminField>
          <AdminField name="addressLine2" label="Morada (linha 2)" state={state}>
            <Input id="addressLine2" name="addressLine2" defaultValue={clinic.addressLine2 ?? ""} className={inputClass} />
          </AdminField>
          <AdminField name="postalCode" label="Código postal" state={state}>
            <Input id="postalCode" name="postalCode" defaultValue={clinic.postalCode} className={inputClass} />
          </AdminField>
          <AdminField name="city" label="Localidade" state={state}>
            <Input id="city" name="city" defaultValue={clinic.city} className={inputClass} />
          </AdminField>
        </div>
        <input type="hidden" name="country" value={clinic.country} />
        <AdminField name="mapsUrl" label="Link do Google Maps" state={state}>
          <Input id="mapsUrl" name="mapsUrl" defaultValue={clinic.mapsUrl ?? ""} placeholder="https://maps.google.com/..." className={inputClass} />
        </AdminField>
        <AdminField
          name="mapsEmbedUrl"
          label="URL de incorporação do mapa (opcional)"
          hint="Google Maps → Partilhar → Incorporar mapa → copie apenas o endereço do atributo src."
          state={state}
        >
          <Input id="mapsEmbedUrl" name="mapsEmbedUrl" defaultValue={clinic.mapsEmbedUrl ?? ""} placeholder="https://www.google.com/maps/embed?..." className={inputClass} />
        </AdminField>
      </Section>

      <Section title="Horário de funcionamento" description="Usado no site e para limitar os dias e horas que os visitantes podem pedir.">
        <div className="space-y-2">
          {DAYS.map((label, i) => {
            const day = i + 1;
            const entry = clinic.openingHours.find((h) => h.day === day);
            return (
              <div key={day} className="grid grid-cols-[5.5rem_1fr_1fr_auto] items-center gap-2 text-sm text-foreground sm:gap-3">
                <span className="font-medium">{label}</span>
                <Input name={`open-${day}`} type="time" defaultValue={entry?.open ?? "09:00"} aria-label={`${label} abertura`} className="h-10" />
                <Input name={`close-${day}`} type="time" defaultValue={entry?.close ?? "18:00"} aria-label={`${label} fecho`} className="h-10" />
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" name={`closed-${day}`} defaultChecked={!!entry?.closed} className={checkboxClass} />
                  Fechado
                </label>
              </div>
            );
          })}
        </div>
        {hoursError && <p className="text-sm font-medium text-destructive" role="alert">{hoursError}</p>}
      </Section>

      <Section title="Marcações">
        <fieldset className="space-y-3">
          <legend className="mb-1 font-semibold text-foreground">Modo de marcação</legend>
          <label className="flex items-start gap-3 rounded-xl bg-sand-100 p-4">
            <input type="radio" name="bookingMode" value="REQUEST" defaultChecked={clinic.bookingMode === "REQUEST"} className={`${checkboxClass} mt-0.5`} />
            <span>
              <strong className="block text-foreground">Pedido de marcação (recomendado)</strong>
              <span className="text-sm text-muted-foreground">O visitante indica a preferência de dia e hora; a equipa confirma.</span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-xl bg-sand-100 p-4">
            <input type="radio" name="bookingMode" value="LIVE" defaultChecked={clinic.bookingMode === "LIVE"} className={`${checkboxClass} mt-0.5`} />
            <span>
              <strong className="block text-foreground">Disponibilidade real</strong>
              <span className="text-sm text-muted-foreground">
                Mostra apenas horários livres, calculados a partir do horário de trabalho de cada profissional. Requer horários configurados e mantidos atualizados.
              </span>
            </span>
          </label>
        </fieldset>
        <AdminField name="retentionDays" label="Conservação dos pedidos (dias)" hint="Pedidos mais antigos podem ser eliminados na página de pedidos." state={state}>
          <Input id="retentionDays" name="retentionDays" type="number" min={30} max={3650} defaultValue={clinic.retentionDays} className={`${inputClass} max-w-40`} />
        </AdminField>
      </Section>

      <Section title="Textos da página inicial">
        <AdminField name="heroTitle" label="Título principal" hint="O texto depois da última vírgula aparece em destaque." state={state}>
          <Input id="heroTitle" name="heroTitle" defaultValue={clinic.heroTitle} className={inputClass} />
        </AdminField>
        <AdminField name="heroSubtitle" label="Subtítulo" state={state}>
          <Textarea id="heroSubtitle" name="heroSubtitle" defaultValue={clinic.heroSubtitle} className={textareaClass} />
        </AdminField>
        <AdminField name="aboutIntro" label="Apresentação (Sobre nós)" state={state}>
          <Textarea id="aboutIntro" name="aboutIntro" defaultValue={clinic.aboutIntro} className={`${textareaClass} min-h-36`} />
        </AdminField>
      </Section>

      <Section title="Redes sociais" description="Deixe em branco para não mostrar.">
        <div className="grid gap-5 sm:grid-cols-3">
          {(["instagram", "facebook", "linkedin"] as const).map((key) => (
            <AdminField key={key} name={key} label={key[0].toUpperCase() + key.slice(1)} state={state}>
              <Input id={key} name={key} defaultValue={clinic.socials[key] ?? ""} placeholder="https://" className={inputClass} />
            </AdminField>
          ))}
        </div>
      </Section>

      <div className="sticky bottom-4 flex justify-end">
        <div className="rounded-full border bg-card p-1.5">
          <SaveButton pending={pending} label="Guardar definições" />
        </div>
      </div>
    </form>
  );
}
