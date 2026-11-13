import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { filteredCatalog } from "@/lib/catalog-filters";
import { speciesOptions } from "@/lib/species-index";
import { speciesLabel } from "@/components/character-details";
import { CatalogFilters } from "@/components/catalog-filters";
import { catalogHref, readQuery, type Query } from "@/lib/query";
import { Cards, Empty } from "@/components/ui";

export const metadata = { title: "Personagens" };

export default async function Characters({ searchParams }: { searchParams: Promise<Query> }) {
  const query = readQuery(await searchParams);
  const page = Number(query.get("page") ?? 1);
  const [data, availableSpecies] = await Promise.all([
    filteredCatalog(query, 60),
    speciesOptions().catch(() => null),
  ]);
  const speciesParam = query.get("species") ?? "";
  const currentSpecies = availableSpecies?.find((value) => value.toLowerCase() === speciesParam.toLowerCase()) ?? speciesParam;
  const species = [...new Set([...(availableSpecies ?? []), currentSpecies].filter(Boolean))]
    .map((value) => ({ value, label: speciesLabel(value) }))
    .sort((first, second) => first.label.localeCompare(second.label, "pt-BR"));
  const selected = query.has("id") ? data?.results[0] : undefined;
  const filters = new URLSearchParams(query);
  filters.delete("page");
  function pageHref(number: number) {
    const next = new URLSearchParams(filters);
    if (number > 1) next.set("page", String(number));
    return catalogHref(next);
  }

  return <section className="content">
    <p className="eyebrow">ARQUIVOS DA CIDADELA</p><h1>Personagens</h1>
    <CatalogFilters key={filters.toString()} name={query.get("name") ?? ""}
      initialStatus={query.get("status") ?? ""} initialSpecies={currentSpecies}
      selected={selected} speciesOptions={species} />
    {!availableSpecies && <p role="status">A lista de espécies está temporariamente indisponível.</p>}
    {data ? <>
      <p className="result-count">{data.info.count} {data.info.count === 1 ? "personagem encontrado" : "personagens encontrados"}</p>
      <Cards compare characters={data.results} suffix={query.size ? "?" + query : ""} />
      {data.info.pages > 1 && <nav className="pagination" aria-label="Paginação">
        {page > 1 && <Link className="button secondary" href={pageHref(page - 1)}><ChevronLeft size={16} /> Anterior</Link>}
        <span>Página {page} de {data.info.pages}</span>
        {page < data.info.pages && <Link className="button secondary" href={pageHref(page + 1)}>Próxima <ChevronRight size={16} /></Link>}
      </nav>}
    </> : <Empty title={page > 1 ? "Página sem resultados" : "Nenhum personagem encontrado"}>
      <p>{page > 1 ? "Volte à primeira página desta pesquisa." : "Experimente outro nome, status ou espécie."}</p>
      <Link className="button secondary" href={page > 1 ? pageHref(1) : "/personagens"}>{page > 1 ? "Primeira página" : "Limpar filtros"}</Link>
    </Empty>}
  </section>;
}
