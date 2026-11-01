"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { purgeExpiredAppointments, type FormState } from "@/app/admin/(panel)/actions";
import { SubmitButton } from "@/components/admin/confirm-button";

export function PurgeButton() {
  const [state, action] = useActionState<FormState>(purgeExpiredAppointments, {});
  return (
    <form action={action} className="mt-4 flex flex-wrap items-center gap-3">
      <SubmitButton
        confirmMessage="Eliminar todos os pedidos que ultrapassaram o prazo de conservação?"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <Trash2 aria-hidden="true" />
        Eliminar pedidos antigos
      </SubmitButton>
      {state.message && <p role="status" className="text-sm text-muted-foreground">{state.message}</p>}
    </form>
  );
}
