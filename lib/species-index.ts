import { unstable_cache } from "next/cache";
import { withCharacterName } from "./character-names";

type Entry = { id: string; name: string; status: string; species: string };
type Group = { info?: { pages: number }; results?: Entry[] };

async function graphql(query: string, species?: string) {
  const response = await fetch("https://rickandmortyapi.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { species } }),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error("Índice de espécies indisponível");
  const payload: { data?: Record<string, Group>; errors?: unknown[] } = await response.json();
  if (!payload.data || payload.errors?.length) throw new Error("Índice de espécies incompleto");
  return payload.data;
}

export const speciesIndex = unstable_cache(async (species?: string) => {
  const header = species ? "query ($species: String!)" : "query";
  const filter = species ? ", filter: { species: $species }" : "";
  const first = await graphql(header + " { first: characters(page: 1" + filter + ") { info { pages } results { id name status species } } }", species);
  const pages = first.first?.info?.pages ?? 0;
  const rows = first.first?.results ?? [];
  if (pages > 1) {
    const fields = Array.from({ length: pages - 1 }, (_, index) =>
      "p" + (index + 2) + ": characters(page: " + (index + 2) + filter + ") { results { id name status species } }"
    );
    const rest = await graphql(header + " { " + fields.join(" ") + " }", species);
    for (let page = 2; page <= pages; page++) rows.push(...(rest["p" + page].results ?? []));
  }
  return rows.map((row) => withCharacterName({ ...row, id: Number(row.id) }));
}, ["portal137-species-index"], { revalidate: 86400 });

export async function speciesOptions() {
  const rows = await speciesIndex();
  return [...new Set(rows.map(({ species }) => species).filter(Boolean))];
}
