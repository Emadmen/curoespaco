"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { serviceIcons } from "@/components/services/service-icon";
import { saveService, type FormState } from "@/app/admin/(panel)/actions";
import { AdminField, FormMessage, SaveButton, checkboxClass, inputClass, submitWithoutReset, textareaClass } from "./form-bits";

type ServiceValues = {
  id?: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  icon: string;
  durationMinutes: number;
  sortOrder: number;
  enabled: boolean;
  professionalIds: string[];
};

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ServiceForm({
  service,
  professionals,
}: {
  service?: ServiceValues;
  professionals: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveService, {});
  return (
    <form onSubmit={submitWithoutReset(action)} className="space-y-6 surface p-5 sm:p-7">
      {service?.id && <input type="hidden" name="id" value={service.id} />}
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <AdminField name="name" label="Nome" state={state}>
          <Input
            id="name"
            name="name"
            defaultValue={service?.name}
            required
            className={inputClass}
            onBlur={(e) => {
              const slug = e.currentTarget.form?.elements.namedItem("slug") as HTMLInputElement | null;
              if (slug && !slug.value) slug.value = slugify(e.currentTarget.value);
            }}
          />
        </AdminField>
        <AdminField name="slug" label="Identificador no URL" hint="Ex.: terapia-de-casal" state={state}>
          <Input id="slug" name="slug" defaultValue={service?.slug} required className={inputClass} />
        </AdminField>
      </div>
      <AdminField name="shortDescription" label="Descrição curta (cartões)" state={state}>
        <Textarea id="shortDescription" name="shortDescription" defaultValue={service?.shortDescription} className={textareaClass} maxLength={220} />
      </AdminField>
      <AdminField name="description" label="Descrição completa" hint="Separe parágrafos com uma linha em branco." state={state}>
        <Textarea id="description" name="description" defaultValue={service?.description} className={`${textareaClass} min-h-44`} />
      </AdminField>
      <div className="grid gap-5 sm:grid-cols-3">
        <AdminField name="icon" label="Ícone" state={state}>
          <select id="icon" name="icon" defaultValue={service?.icon ?? "sparkles"} className={`${inputClass} w-full border border-input`}>
            {Object.entries(serviceIcons).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField name="durationMinutes" label="Duração (min)" state={state}>
          <Input id="durationMinutes" name="durationMinutes" type="number" min={15} max={240} defaultValue={service?.durationMinutes ?? 50} className={inputClass} />
        </AdminField>
        <AdminField name="sortOrder" label="Ordem" hint="Menor aparece primeiro" state={state}>
          <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={service?.sortOrder ?? 0} className={inputClass} />
        </AdminField>
      </div>
      <fieldset>
        <legend className="mb-2 font-semibold text-foreground">Profissionais que prestam este serviço</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((p) => (
            <label key={p.id} className="flex items-center gap-2.5 rounded-xl bg-sand-100 px-3 py-2.5 text-foreground">
              <input type="checkbox" name="professionalIds" value={p.id} defaultChecked={service?.professionalIds.includes(p.id)} className={checkboxClass} />
              {p.name}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-2.5 font-semibold text-foreground">
        <input type="checkbox" name="enabled" defaultChecked={service?.enabled ?? true} className={checkboxClass} />
        Visível no site
      </label>
      <div className="flex justify-end border-t border-border pt-5">
        <SaveButton pending={pending} />
      </div>
    </form>
  );
}
