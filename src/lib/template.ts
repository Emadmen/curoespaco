/**
 * TEMPORARY: lets the client compare UI templates on the live site before choosing one.
 * The choice lives in a cookie and on <html data-template="…">, so CSS can target
 * `[data-template="2"] …` (or "3") and server code can read the cookie once option 2 needs it.
 * Remove this file, the switcher and the script in the root layout once a template is chosen.
 */
export const TEMPLATES = [
  { id: "1", label: "Opção 1" },
  { id: "2", label: "Opção 2" },
  { id: "3", label: "Opção 3" },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]["id"];

export const TEMPLATE_COOKIE = "cora-template";
export const DEFAULT_TEMPLATE: TemplateId = "1";

export function isTemplate(value: unknown): value is TemplateId {
  return TEMPLATES.some((tpl) => tpl.id === value);
}

/** Runs before the page paints, so the right template shows with no flash. */
export const templateScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${TEMPLATE_COOKIE}=([^;]*)/);var v=m?m[1]:"${DEFAULT_TEMPLATE}";if(!/^[123]$/.test(v))v="${DEFAULT_TEMPLATE}";document.documentElement.dataset.template=v}catch(e){}})();`;
