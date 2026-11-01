"use client";

import { startTransition, type FormEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FormState } from "@/app/admin/(panel)/actions";

export function AdminField({
  name,
  label,
  hint,
  state,
  children,
  className,
}: {
  name: string;
  label: string;
  hint?: string;
  state?: FormState;
  children: ReactNode;
  className?: string;
}) {
  const error = state?.errors?.[name]?.[0];
  return (
    <div className={className}>
      <Label htmlFor={name} className="mb-1.5 font-semibold text-foreground">
        {label}
      </Label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-sm font-medium text-destructive" role="alert">
          <AlertCircle className="size-3.5" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p
      role="status"
      className={cn(
        "flex items-center gap-2 rounded-xl p-3 text-sm font-medium",
        state.ok ? "bg-sage-100 text-foreground" : "bg-danger-100 text-destructive",
      )}
    >
      {state.ok ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <AlertCircle className="size-4" aria-hidden="true" />}
      {state.message}
    </p>
  );
}

/**
 * Submits a form to a server action without React's automatic form reset, so
 * the admin keeps their input when validation fails.
 */
export function submitWithoutReset(action: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => action(formData));
  };
}

export function SaveButton({ label = "Guardar", pending: pendingProp }: { label?: string; pending?: boolean }) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
      {label}
    </Button>
  );
}

export const inputClass = "h-11";
export const textareaClass = "";
export const checkboxClass = "size-5 rounded accent-primary";
