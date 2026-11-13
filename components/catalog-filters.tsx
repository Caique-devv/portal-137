"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Search } from "lucide-react";
import type { Character } from "@/lib/api";
import { catalogHref, matchesCharacterFilters } from "@/lib/query";
import { CharacterSuggestions } from "./character-suggestions";

export function CatalogFilters({ name, initialStatus, initialSpecies, speciesOptions, selected }: {
  name: string;
  initialStatus: string;
  initialSpecies: string;
  speciesOptions: { value: string; label: string }[];
  selected?: Character;
}) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState(initialStatus);
  const [species, setSpecies] = useState(initialSpecies);

  function apply(item?: Character, clearName = false, overrides?: { status?: string; species?: string }) {
    if (!form.current) return;
    const data = new FormData(form.current);
    const next = new URLSearchParams();
    const text = clearName ? "" : String(data.get("name") ?? "").trim();
    const nextStatus = overrides?.status ?? String(data.get("status") ?? "");
    const nextSpecies = overrides?.species ?? String(data.get("species") ?? "");
    const chosen = item ?? (text && text === selected?.name ? selected : undefined);
    if (nextStatus) next.set("status", nextStatus);
    if (nextSpecies) next.set("species", nextSpecies);
    if (chosen) {
      if (matchesCharacterFilters(chosen, nextStatus, nextSpecies)) next.set("id", String(chosen.id));
    } else if (text) {
      next.set("name", text);
    }
    router.push(catalogHref(next), { scroll: false });
  }

  return <form className="filters catalog-filters" ref={form} onSubmit={(event) => {
    event.preventDefault();
    apply();
  }}>
    <CharacterSuggestions inputId="catalog-name" listId="catalog-name-options" label="Nome" formName="name"
      initialValue={selected?.name ?? name} status={status} species={species}
      onChoose={(item) => apply(item)} onClear={() => apply(undefined, true)} />
    <div className="catalog-filter-field"><label htmlFor="catalog-status">Status</label><select id="catalog-status" name="status" value={status} onChange={(event) => {
      setStatus(event.target.value);
      apply(undefined, false, { status: event.target.value });
    }}><option value="">Todos</option><option value="alive">Vivo</option><option value="dead">Morto</option><option value="unknown">Desconhecido</option></select></div>
    <div className="catalog-filter-field"><label htmlFor="catalog-species">Espécie</label><select id="catalog-species" name="species" value={species} onChange={(event) => {
      setSpecies(event.target.value);
      apply(undefined, false, { species: event.target.value });
    }}><option value="">Todas as espécies</option>
      {speciesOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
    </select></div>
    <button className="button primary" type="submit"><Search size={17} aria-hidden="true" /> Buscar</button>
    <Link className="button secondary" href="/personagens">Limpar filtros</Link>
  </form>;
}
