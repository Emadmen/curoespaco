"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

/** Submit button that asks for confirmation and shows a pending state. */
export function SubmitButton({
  children,
  confirmMessage,
  className,
  ...rest
}: {
  children: ReactNode;
  confirmMessage?: string;
  className?: string;
  "aria-label"?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) e.preventDefault();
      }}
      className={cn("disabled:opacity-50", className)}
      {...rest}
    >
      {children}
    </button>
  );
}
