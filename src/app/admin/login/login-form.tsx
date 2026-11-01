"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-5">
      <div>
        <Label htmlFor="email" className="mb-2 font-semibold text-foreground">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div>
        <Label htmlFor="password" className="mb-2 font-semibold text-foreground">Palavra-passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state.error && (
        <p role="alert" className="flex items-center gap-2 rounded-xl bg-danger-100 p-3 text-sm font-medium text-destructive">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <LogIn aria-hidden="true" />}
        Entrar
      </Button>
    </form>
  );
}
