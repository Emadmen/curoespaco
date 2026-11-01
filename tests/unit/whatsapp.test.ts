import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl, formatPhoneDisplay, normalizeWhatsAppNumber, whatsappMessages } from "@/lib/whatsapp";

function decodeText(url: string) {
  return new URL(url).searchParams.get("text");
}

describe("normalizeWhatsAppNumber", () => {
  it.each([
    ["351910000000", "351910000000"],
    ["+351 910 000 000", "351910000000"],
    ["00351910000000", "351910000000"],
    ["910 000 000", "351910000000"],
    ["(+351) 21-000-0000", "351210000000"],
    ["+55 11 98765 4321", "5511987654321"],
  ])("%s → %s", (input, expected) => {
    expect(normalizeWhatsAppNumber(input)).toBe(expected);
  });

  it("rejects unusable numbers", () => {
    expect(normalizeWhatsAppNumber("")).toBeNull();
    expect(normalizeWhatsAppNumber("123")).toBeNull();
    expect(normalizeWhatsAppNumber(null)).toBeNull();
  });
});

describe("buildWhatsAppUrl", () => {
  it("uses the official wa.me format with the configured number", () => {
    expect(buildWhatsAppUrl("+351 910 000 000")).toBe("https://wa.me/351910000000");
  });

  it("URL-encodes the message so special characters survive", () => {
    const message = "Olá! Serviço: Terapia de Casal & Família?\nData: 3/11 #1";
    const url = buildWhatsAppUrl("351910000000", message);
    expect(url.startsWith("https://wa.me/351910000000?text=")).toBe(true);
    expect(url).not.toContain(" ");
    expect(url).not.toContain("\n");
    expect(decodeText(url)).toBe(message);
  });
});

describe("whatsappMessages", () => {
  it("general", () => {
    expect(whatsappMessages.general()).toBe(
      "Olá! Gostaria de obter informações e marcar uma consulta. Podem ajudar-me?",
    );
  });

  it("service", () => {
    expect(whatsappMessages.service("Terapia de Casal")).toBe(
      "Olá! Gostaria de marcar uma consulta de Terapia de Casal. Podem ajudar-me?",
    );
  });

  it("therapist", () => {
    expect(whatsappMessages.therapist("Rui Exemplo")).toBe(
      "Olá! Gostaria de saber a disponibilidade para uma consulta com Rui Exemplo. Obrigado/a!",
    );
  });

  it("booking with all preferences", () => {
    expect(
      whatsappMessages.booking({ service: "Psicologia Individual", therapist: "Marta Exemplo", date: "2026-11-03", time: "10:00" }),
    ).toBe(
      "Olá! Gostaria de solicitar uma consulta.\n\nServiço: Psicologia Individual\nProfissional: Marta Exemplo\nData preferida: terça-feira, 3 de novembro de 2026\nHorário preferido: 10:00\n\nPodem confirmar a disponibilidade? Obrigado/a!",
    );
  });

  it("booking without professional uses 'Sem preferência'", () => {
    const text = whatsappMessages.booking({ service: "Terapia Familiar", therapist: null, date: "2026-11-03", time: "15:00" });
    expect(text).toContain("Profissional: Sem preferência");
  });

  it("never includes anything beyond the booking preferences", () => {
    const text = whatsappMessages.booking({ service: "X", therapist: null, date: null, time: null });
    expect(text.split("\n").filter(Boolean)).toHaveLength(6); // greeting, 4 preference lines, closing
  });
});

describe("formatPhoneDisplay", () => {
  it("groups Portuguese numbers", () => {
    expect(formatPhoneDisplay("351910000000")).toBe("+351 910 000 000");
  });
});
