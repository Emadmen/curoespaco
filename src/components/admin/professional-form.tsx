"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveProfessional, type FormState } from "@/app/admin/(panel)/actions";
import { AdminField, FormMessage, SaveButton, checkboxClass, inputClass, submitWithoutReset, textareaClass } from "./form-bits";
import { slugify } from "./service-form";

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

type ProfessionalValues = {
  id?: string;
  name: string;
  slug: string;
  title: string;
  bio: string;
  registrationNumber: string;
  expertise: string[];
  sortOrder: number;
  enabled: boolean;
  serviceIds: string[];
  imageUrl: string | null;
  /** day ("1".."7") → "09:00-13:00, 14:00-19:00" */
  workingHours: Record<string, string>;
};

export function ProfessionalForm({
  professional,
  services,
}: {
  professional?: ProfessionalValues;
  services: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProfessional, {});
  const [preview, setPreview] = useState<string | null>(professional?.imageUrl ?? null);

  return (
    <form onSubmit={submitWithoutReset(action)} className="space-y-6 surface p-5 sm:p-7" encType="multipart/form-data">
      {professional?.id && <input type="hidden" name="id" value={professional.id} />}
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <AdminField name="name" label="Nome" state={state}>
          <Input
            id="name"
            name="name"
            defaultValue={professional?.name}
            required
            className={inputClass}
            onBlur={(e) => {
              const slug = e.currentTarget.form?.elements.namedItem("slug") as HTMLInputElement | null;
              if (slug && !slug.value) slug.value = slugify(e.currentTarget.value);
            }}
          />
        </AdminField>
        <AdminField name="slug" label="Identificador no URL" hint="Ex.: ana-silva" state={state}>
          <Input id="slug" name="slug" defaultValue={professional?.slug} required className={inputClass} />
        </AdminField>
        <AdminField name="title" label="Especialidade / função" hint="Ex.: Psicóloga Clínica" state={state}>
          <Input id="title" name="title" defaultValue={professional?.title} required className={inputClass} />
        </AdminField>
        <AdminField name="registrationNumber" label="N.º de cédula profissional" hint="Opcional. Ex.: OPP n.º 12345" state={state}>
          <Input id="registrationNumber" name="registrationNumber" defaultValue={professional?.registrationNumber} className={inputClass} />
        </AdminField>
      </div>
      <AdminField name="bio" label="Biografia" hint="Use apenas informação verdadeira e verificável." state={state}>
        <Textarea id="bio" name="bio" defaultValue={professional?.bio} className={`${textareaClass} min-h-36`} />
      </AdminField>
      <AdminField name="expertise" label="Áreas de acompanhamento" hint="Separadas por vírgulas. Ex.: Adultos, Ansiedade, Casais" state={state}>
        <Input id="expertise" name="expertise" defaultValue={professional?.expertise.join(", ")} className={inputClass} />
      </AdminField>

      <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="size-28 overflow-hidden rounded-t-full rounded-b-2xl bg-sage-100">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-xs text-muted-foreground">Sem foto</span>
          )}
        </div>
        <div className="space-y-2">
          <AdminField name="image" label="Fotografia" hint="JPG, PNG ou WebP, até 2 MB. Formato vertical recomendado." state={state}>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-sage-100 file:px-4 file:py-2 file:font-semibold file:text-foreground"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                setPreview(file ? URL.createObjectURL(file) : professional?.imageUrl ?? null);
              }}
            />
          </AdminField>
          {professional?.imageUrl && (
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" name="removeImage" className={checkboxClass} /> Remover fotografia atual
            </label>
          )}
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 font-semibold text-foreground">Serviços</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <label key={s.id} className="flex items-center gap-2.5 rounded-xl bg-sand-100 px-3 py-2.5 text-foreground">
              <input type="checkbox" name="serviceIds" value={s.id} defaultChecked={professional?.serviceIds.includes(s.id)} className={checkboxClass} />
              {s.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-semibold text-foreground">Horário de trabalho</legend>
        <p className="mt-1 mb-3 text-xs text-muted-foreground">
          Usado apenas no modo “Disponibilidade real”. Formato: 09:00-13:00, 14:00-19:00. Deixe vazio nos dias sem consultas.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {DAYS.map((label, i) => (
            <label key={label} className="flex items-center gap-3 text-sm text-foreground">
              <span className="w-16 shrink-0 font-medium">{label}</span>
              <Input name={`wh-${i + 1}`} defaultValue={professional?.workingHours[String(i + 1)] ?? ""} placeholder="—" className="h-10" />
            </label>
          ))}
        </div>
        {state.errors?.workingHours?.[0] && (
          <p className="mt-2 text-sm font-medium text-destructive" role="alert">{state.errors.workingHours[0]}</p>
        )}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <AdminField name="sortOrder" label="Ordem" hint="Menor aparece primeiro" state={state}>
          <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={professional?.sortOrder ?? 0} className={inputClass} />
        </AdminField>
        <label className="flex items-center gap-2.5 self-end pb-3 font-semibold text-foreground">
          <input type="checkbox" name="enabled" defaultChecked={professional?.enabled ?? true} className={checkboxClass} />
          Perfil visível no site
        </label>
      </div>
      <div className="flex justify-end border-t border-border pt-5">
        <SaveButton pending={pending} />
      </div>
    </form>
  );
}
