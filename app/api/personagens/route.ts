import { filteredCatalog } from "@/lib/catalog-filters";
import { readQuery } from "@/lib/query";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = readQuery({ name: params.get("name") ?? undefined, page: params.get("page") ?? undefined, status: params.get("status") ?? undefined, species: params.get("species") ?? undefined });
  if (!query.has("name")) return Response.json(null);
  if (query.get("page") === "1") query.delete("page");
  try {
    return Response.json(await filteredCatalog(query, 60));
  } catch {
    return Response.json({ error: "Busca indisponível" }, { status: 503 });
  }
}
