import { buildPaletteIndex } from "@/lib/paletteIndex";

export const dynamic = "force-static";

export function GET() {
  return Response.json(buildPaletteIndex());
}
