import { characterNames, withCharacterName } from "./character-names";

export type Place = { name: string; url: string };
export type Character = {
  id: number; name: string; image: string; status: "Alive" | "Dead" | "unknown";
  species: string; gender: string; origin: Place; location: Place; episode: string[];
};
export type Episode = { id: number; name: string; episode: string; air_date: string; characters: string[] };
export type Location = { id: number; name: string; type: string; dimension: string; residents: string[] };
type Resources = { character: Character; episode: Episode; location: Location };
type Resource = keyof Resources;
export type Catalog = { info: { count: number; pages: number }; results: Character[] };

const base = "https://rickandmortyapi.com/api/";

async function get<T>(path: string, revalidate?: number): Promise<T | null> {
  const response = await fetch(base + path, { signal: AbortSignal.timeout(12000), next: { revalidate } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Falha na Rick and Morty API");
  return response.json();
}

const pageSize = 20;

function rawCatalog(query: URLSearchParams, revalidate?: number) {
  return get<Catalog>("character?" + query, revalidate);
}

export async function catalog(query = new URLSearchParams(), revalidate?: number): Promise<Catalog | null> {
  const name = query.get("name")?.trim().toLowerCase();
  const matches = (value: string) => Boolean(name && name.length >= 3 && value.toLowerCase().includes(name));
  const requestedPage = Number(query.get("page") ?? 1);
  const start = (requestedPage - 1) * pageSize;
  const affected = [...characterNames].filter(([, names]) => matches(names.original) !== matches(names.corrected));

  if (!affected.length) {
    const data = await rawCatalog(query, revalidate);
    return data && { ...data, results: data.results.map(withCharacterName) };
  }

  const filters = new URLSearchParams(query);
  filters.delete("page");
  const ids = affected.filter(([, names]) => matches(names.corrected)).map(([id]) => id);
  const [first, aliases] = await Promise.all([
    rawCatalog(filters, revalidate),
    ids.length ? get<Character | Character[]>("character/" + ids.join(","), 300) : null,
  ]);
  const otherPages = Array.from({ length: (first?.info.pages ?? 1) - 1 }, (_, index) => {
    const next = new URLSearchParams(filters);
    next.set("page", String(index + 2));
    return rawCatalog(next, revalidate);
  });
  const status = filters.get("status")?.toLowerCase();
  const species = filters.get("species")?.toLowerCase();
  const corrected = (Array.isArray(aliases) ? aliases : aliases ? [aliases] : []).filter((character) =>
    (!status || character.status.toLowerCase() === status)
    && (!species || character.species.toLowerCase().includes(species))
  ).map(withCharacterName);
  const upstream = [first, ...await Promise.all(otherPages)].flatMap((data) => data?.results ?? []).map(withCharacterName);
  const retained = upstream.filter((character) => !characterNames.has(character.id) || matches(character.name));
  const unique = new Map<number, Character>();
  for (const character of [...corrected, ...retained]) unique.set(character.id, character);
  const count = unique.size;
  if (start >= count) return null;
  return { info: { count, pages: Math.ceil(count / pageSize) }, results: [...unique.values()].slice(start, start + pageSize) };
}
export async function randomCharacter() {
  const first = await catalog();
  if (!first?.info.count || !first.results.length) throw new Error("Catálogo indisponível");
  const position = Math.floor(Math.random() * first.info.count);
  const size = first.results.length;
  const page = Math.floor(position / size) + 1;
  const data = page === 1 ? first : await catalog(new URLSearchParams({ page: String(page) }));
  const character = data?.results[position % size];
  if (!character) throw new Error("Posição indisponível");
  return character;
}

export function validId(id: string) {
  return /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id));
}

export function resourceId(url: string, resource: Resource) {
  const prefix = base + resource + "/";
  const id = url.startsWith(prefix) ? url.slice(prefix.length) : "";
  return validId(id) ? id : null;
}

export async function detail<K extends Resource>(resource: K, id: string) {
  if (!validId(id)) return null;
  const record = await get<Resources[K]>(resource + "/" + id, 300);
  return record && resource === "character" ? withCharacterName(record) : record;
}

export async function batch<K extends Resource>(resource: K, urls: string[]): Promise<Resources[K][]> {
  const ids = [...new Set(urls.map((url) => resourceId(url, resource)).filter(Boolean))];
  const groups = [];
  for (let i = 0; i < ids.length; i += 50) groups.push(ids.slice(i, i + 50));
  const batches = await Promise.all(groups.map(async (group) => {
    const data = await get<Resources[K] | Resources[K][]>(resource + "/" + group.join(","), 300);
    if (!data) throw new Error("Referências indisponíveis");
    const records = Array.isArray(data) ? data : [data];
    const byId = new Map(records.map((record) => [String(record.id), record]));
    return group.flatMap((id) => {
      const record = byId.get(id!);
      return record ? [resource === "character" ? withCharacterName(record) : record] : [];
    });
  }));
  return batches.flat();
}
