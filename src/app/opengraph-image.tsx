import { ImageResponse } from "next/og";
import { getClinic } from "@/lib/data";

export const alt = "Psicologia e bem-estar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const forest = "#33211a";

export default async function OpengraphImage() {
  const clinic = await getClinic();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f8b9a2",
          padding: 72,
          position: "relative",
          fontFamily: "sans-serif",
          color: forest,
        }}
      >
        <div style={{ position: "absolute", right: -60, top: -120, width: 520, height: 520, borderRadius: 130, border: `1px solid ${forest}`, opacity: 0.4 }} />
        <div style={{ position: "absolute", right: 240, bottom: -160, width: 420, height: 420, borderRadius: 110, border: `1px solid ${forest}`, opacity: 0.4 }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 860 }}>
          <div style={{ fontSize: 34 }}>{clinic.name}</div>
          <div style={{ fontSize: 76, lineHeight: 1.04, letterSpacing: "-0.03em" }}>{clinic.heroTitle}</div>
          <div style={{ fontSize: 26 }}>{clinic.tagline}</div>
        </div>
      </div>
    ),
    size,
  );
}
