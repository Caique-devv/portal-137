import { batch, catalog, detail, type Catalog } from "./api";
import { characterNames } from "./character-names";
import { matchesCharacterFilters } from "./query";
import { speciesIndex } from "./species-index";

const pageSize = 20;

export async function filteredCatalog(query: URLSearchParams, revalidate?: number): Promise<Catalog | null> {
  const id = query.get("id");
  const status = query.get("status") ?? "";
  const species = query.get("species") ?? "";

  if (id) {
    const character = await detail("character", id);
    return character && matchesCharacterFilters(character, status, species)
      ? { info: { count: 1, pages: 1 }, results: [character] }
      : null;
  }

  if (!species) return catalog(query, revalidate);

  // The upstream species filter matches substrings, including Humanoid when asked for Human.
  const name = query.get("name")?.toLowerCase() ?? "";
  const rows = (await speciesIndex(species)).filter((row) =>
    matchesCharacterFilters(row, status, species) && (!name || row.name.toLowerCase().includes(name)));
  const start = (Number(query.get("page") ?? 1) - 1) * pageSize;
  if (start >= rows.length) return null;

  const preferred = rows.filter(({ id }) => characterNames.get(id)?.corrected.toLowerCase() === name);
  const preferredIds = new Set(preferred.map(({ id }) => id));
  const ordered = [...preferred, ...rows.filter(({ id }) => !preferredIds.has(id))];
  const results = await batch("character", ordered.slice(start, start + pageSize)
    .map(({ id }) => "https://rickandmortyapi.com/api/character/" + id));
  return { info: { count: rows.length, pages: Math.ceil(rows.length / pageSize) }, results };
}
