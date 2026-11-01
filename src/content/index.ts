import { ptPT, type Dictionary } from "./pt-PT";

/** Active dictionary. Swap for another locale file with the same shape. */
export const t: Dictionary = ptPT;

/** Replaces `{key}` placeholders in a template string. */
export function format(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
