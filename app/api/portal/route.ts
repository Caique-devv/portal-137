import { randomCharacter } from "@/lib/api";

export async function GET() {
  try {
    const { id } = await randomCharacter();
    return Response.json({ id }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Portal indisponível" }, { status: 503 });
  }
}
