export type Query = Record<string, string | string[] | undefined>;

export function readQuery(input: Query) {
  const query = new URLSearchParams();
  for (const key of ["name", "status", "species", "page", "id"]) {
    const value = input[key];
    if (typeof value !== "string" || !value.trim()) continue;
    if (key === "status" && !["alive", "dead", "unknown"].includes(value)) continue;
    if ((key === "page" || key === "id") && (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)))) continue;
    query.set(key, value.trim());
  }
  return query;
}

export function catalogHref(query: URLSearchParams) {
  return "/personagens" + (query.size ? "?" + query : "");
}

export function matchesCharacterFilters(character: { status: string; species: string }, status: string, species: string) {
  return (!status || character.status.toLowerCase() === status.toLowerCase())
    && (!species || character.species.toLowerCase() === species.toLowerCase());
}
