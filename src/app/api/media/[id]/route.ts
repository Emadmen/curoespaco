import { prisma } from "@/lib/db";

/** Serves uploaded public images (professional portraits). IDs are immutable, so cache aggressively. */
export async function GET(_req: Request, ctx: RouteContext<"/api/media/[id]">) {
  const { id } = await ctx.params;
  if (!/^[a-z0-9]{10,40}$/i.test(id)) return new Response("Not found", { status: 404 });
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(asset.data), {
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": String(asset.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
