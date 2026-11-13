"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { comparisonHref } from "@/lib/comparison";
import type { Character, Episode } from "@/lib/api";
import { PlaceLink, placeName } from "./character-details";
import { Empty } from "./ui";

const tabs = [
  { id: "all", label: "Todos" },
  { id: "ricks", label: "Ricks" },
  { id: "mortys", label: "Mortys" },
] as const;
type Tab = typeof tabs[number]["id"];
export type ArchiveEntry = { character: Character; group: Exclude<Tab, "all">; first?: Episode };

function searchable(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function CitadelArchive({ entries }: { entries: ArchiveEntry[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<Character[]>([]);
  const [notice, setNotice] = useState("");
  const tabButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const query = searchable(input.trim());
  const visible = entries.filter(({ character, group }) =>
    (tab === "all" || group === tab) &&
    (searchable(character.name).includes(query) || searchable(placeName(character.origin)).includes(query))
  );

  function remove(id: number) {
    setSelected(selected.filter((character) => character.id !== id));
    setNotice("");
  }

  function toggle(character: Character) {
    if (selected.some(({ id }) => id === character.id)) remove(character.id);
    else if (selected.length === 2) setNotice("Remova um dos dois personagens para selecionar outro.");
    else {
      setSelected([...selected, character]);
      setNotice("");
    }
  }

  function navigateTabs(event: KeyboardEvent, index: number) {
    const next = ({
      ArrowLeft: (index + tabs.length - 1) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    } as Record<string, number>)[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setTab(tabs[next].id);
    tabButtons.current[next]?.focus();
  }

  return <>
    {selected.length > 0 && <section className="archive-selection" aria-label="Seleção para comparar">
      <ul>{selected.map((character) => (
        <li key={character.id}>
          <Image src={character.image} alt="" width={44} height={44} />
          <strong>{character.name}</strong>
          <button className="button secondary" type="button" aria-label={"Remover " + character.name + " #" + character.id}
            onClick={() => remove(character.id)}>Remover</button>
        </li>
      ))}</ul>
      <p role="status">{notice || (selected.length === 1 ? "Escolha mais um personagem" : "Dois personagens selecionados")}</p>
      {selected.length === 2 && <Link className="button primary" href={comparisonHref({
        a: String(selected[0].id), b: String(selected[1].id),
      })}>Comparar personagens</Link>}
    </section>}
    <div className="archive-tabs" role="tablist" aria-label="Variantes">
      {tabs.map(({ id, label }, index) => (
        <button key={id} ref={(element) => { tabButtons.current[index] = element; }}
          className={"button " + (id === tab ? "primary" : "secondary")} type="button" role="tab"
          id={"archive-tab-" + id} aria-selected={tab === id} aria-controls={"archive-panel-" + id}
          tabIndex={id === tab ? 0 : -1} onClick={() => setTab(id)} onKeyDown={(event) => navigateTabs(event, index)}>{label}</button>
      ))}
    </div>
    <div className="archive-search">
      <label htmlFor="archive-search">Buscar por nome ou origem</label>
      <input id="archive-search" type="search" value={input} onChange={(event) => setInput(event.target.value)} />
    </div>
    {tabs.map(({ id }) => <div key={id} id={"archive-panel-" + id} role="tabpanel"
      aria-labelledby={"archive-tab-" + id} hidden={id !== tab}>
      {id === tab && (visible.length ? <div className="cards archive-cards">{visible.map(({ character, first }) => {
        const active = selected.some((item) => item.id === character.id);
        return <article className="card archive-card" data-selected={active} key={character.id}>
          <Link className="card-link" href={"/personagens/" + character.id} prefetch={false}>
            <Image src={character.image} alt="" width={300} height={300} sizes="(max-width: 660px) 45vw, 230px" />
            <div className="card-info"><h2>{character.name}</h2></div>
          </Link>
          <dl className="archive-facts">
            <div><dt>Origem</dt><dd><PlaceLink place={character.origin} /></dd></div>
            <div><dt>Primeira aparição</dt><dd>{first ? <Link href={"/episodios/" + first.id} prefetch={false}>{first.episode} · {first.name}</Link> : "Desconhecido"}</dd></div>
          </dl>
          <div className="card-actions"><button className={"button " + (active ? "primary" : "secondary")} type="button"
            aria-pressed={active} aria-label={"Selecionar para comparar " + character.name + " #" + character.id}
            onClick={() => toggle(character)}>{active ? "Selecionado" : "Selecionar para comparar"}</button></div>
        </article>;
      })}</div> : <Empty title="Nenhum personagem encontrado"><p>Tente outro nome ou origem nesta aba.</p></Empty>)}
    </div>)}
  </>;
}
