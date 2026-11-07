"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { DEFAULT_TEMPLATE, isTemplate, TEMPLATE_COOKIE, TEMPLATES, type TemplateId } from "@/lib/template";

function readTemplate(): TemplateId {
  const value = document.documentElement.dataset.template;
  return isTemplate(value) ? value : DEFAULT_TEMPLATE;
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-template"] });
  return () => observer.disconnect();
}

/** TEMPORARY: the UI template the visitor has picked. */
export function useTemplate(): TemplateId {
  return useSyncExternalStore(subscribe, readTemplate, () => DEFAULT_TEMPLATE);
}

/** TEMPORARY: a dropdown in the header to switch between the UI templates the client is comparing. */
export function TemplateSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  // The inline script in the root layout has already read the cookie onto <html>.
  const current = useTemplate();

  const choose = (value: unknown) => {
    if (!isTemplate(value)) return;
    document.documentElement.dataset.template = value;
    document.cookie = `${TEMPLATE_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
    // Server components can read the cookie too, once a template needs them to.
    router.refresh();
  };

  const label = TEMPLATES.find((tpl) => tpl.id === current)?.label;

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`Versão do site: ${label}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1 px-3", className)}
      >
        <span className="max-sm:hidden">Versão</span>
        <span className="sm:hidden">V{current}</span>
        <span className="max-sm:hidden">{current}</span>
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end" className="z-50">
          <Menu.Popup className="min-w-40 rounded-xl border bg-background p-1 text-sm text-foreground shadow-lg outline-none">
            <Menu.RadioGroup value={current} onValueChange={choose}>
              {TEMPLATES.map((tpl) => (
                <Menu.RadioItem
                  key={tpl.id}
                  value={tpl.id}
                  className="flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 outline-none select-none data-highlighted:bg-muted"
                >
                  {tpl.label}
                  <Menu.RadioItemIndicator>
                    <Check aria-hidden="true" className="size-4" />
                  </Menu.RadioItemIndicator>
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
