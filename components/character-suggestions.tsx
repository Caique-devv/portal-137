"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Catalog, Character } from "@/lib/api";

type Search = {
  name: string;
  page: number;
  pages: number;
  items: Character[];
  failed: boolean;
};

export function CharacterSuggestions({ inputId, listId, label, initialValue = "", status = "", species = "",
  selectedId, otherId, onChoose, onClear, formName }: {
  inputId: string;
  listId: string;
  label: string;
  initialValue?: string;
  status?: string;
  species?: string;
  selectedId?: string;
  otherId?: string;
  onChoose: (item: Character) => void;
  onClear?: () => void;
  formName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState(initialValue);
  const [editing, setEditing] = useState(false);
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState<Search>();
  const [activeId, setActiveId] = useState<number>();
  const name = editing ? input.trim() : "";
  const params = new URLSearchParams({ name, status, species });
  const searchKey = params.toString();
  const [previousKey, setPreviousKey] = useState(searchKey);
  if (previousKey !== searchKey) {
    setPreviousKey(searchKey);
    setPage(1);
    setSearch(undefined);
    setActiveId(undefined);
  }
  const shown = name && search?.name === searchKey ? search : undefined;
  const pending = Boolean(name && shown?.page !== page);
  const items = shown?.items ?? [];
  const eligible = items.filter(({ id }) => String(id) !== otherId && String(id) !== selectedId);
  const active = eligible.find(({ id }) => id === activeId);
  const optionId = (id: number) => listId + "-" + id;

  useEffect(() => {
    if (!name) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const query = new URLSearchParams(searchKey);
        if (page > 1) query.set("page", String(page));
        const response = await fetch("/api/personagens?" + query, { signal: controller.signal });
        if (!response.ok) throw new Error("Busca indisponível");
        const data: Catalog | null = await response.json();
        if (controller.signal.aborted) return;
        setSearch((previous) => {
          const earlier = page > 1 && previous?.name === searchKey ? previous.items : [];
          const items = [...new Map([...earlier, ...(data?.results ?? [])].map((item) => [item.id, item])).values()];
          return { name: searchKey, page, pages: data?.info.pages ?? 0, items, failed: false };
        });
      } catch {
        if (controller.signal.aborted) return;
        setSearch((previous) => ({
          name: searchKey, page, failed: true,
          items: page > 1 && previous?.name === searchKey ? previous.items : [],
          pages: page > 1 && previous?.name === searchKey ? previous.pages : 0,
        }));
      }
    }, page === 1 ? 300 : 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [name, page, attempt, searchKey]);

  useEffect(() => {
    if (activeId !== undefined) document.getElementById(listId + "-" + activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId, listId]);

  function reset(value: string, open: boolean) {
    setInput(value);
    setEditing(open);
    setActiveId(undefined);
    setPage(1);
    setSearch(undefined);
  }

  function choose(item: Character) {
    const id = String(item.id);
    if (id === otherId || id === selectedId) return;
    reset(item.name, false);
    onChoose(item);
  }

  return <div className="compare-picker">
    <label htmlFor={inputId}>{label}</label>
    <div className="compare-input">
      <input ref={inputRef} id={inputId} name={formName} type="text" role="combobox" autoComplete="off"
        aria-autocomplete="list" aria-expanded={items.length > 0} aria-controls={items.length ? listId : undefined}
        aria-activedescendant={active ? optionId(active.id) : undefined}
        value={input} placeholder="Digite um nome"
        onChange={(event) => {
          const value = event.target.value;
          if (!editing || value.trim() !== name) reset(value, true);
          else setInput(value);
        }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === "Escape" && editing) {
            event.preventDefault();
            reset(initialValue, false);
          }
          if (event.key === "Enter" && active) {
            event.preventDefault();
            choose(active);
          }
          if ((event.key === "ArrowDown" || event.key === "ArrowUp") && eligible.length) {
            event.preventDefault();
            const step = event.key === "ArrowDown" ? 1 : -1;
            const index = eligible.findIndex(({ id }) => id === activeId);
            const next = index < 0 ? (step === 1 ? 0 : eligible.length - 1) : (index + step + eligible.length) % eligible.length;
            setActiveId(eligible[next].id);
          }
        }} />
      {input && <button type="button" className="button secondary" aria-label={"Limpar " + label.toLowerCase()}
        onClick={() => {
          reset("", false);
          inputRef.current?.focus();
          onClear?.();
        }}>Limpar</button>}
    </div>
    <div role="status" className="muted">
      {pending && "Buscando personagens…"}
      {!pending && shown?.failed && "Não foi possível concluir a busca."}
      {!pending && shown && !shown.failed && !items.length && "Nenhum personagem encontrado"}
    </div>
    {items.length > 0 && <ul id={listId} role="listbox" aria-label={"Sugestões de " + label.toLowerCase()} className="compare-results">
      {items.map((item) => {
        const id = String(item.id);
        const disabled = id === otherId || id === selectedId;
        const origin = item.origin?.name;
        return <li key={id} id={optionId(item.id)} role="option" aria-disabled={disabled}
          aria-selected={active?.id === item.id}
          onMouseDown={(event) => event.preventDefault()} onClick={() => choose(item)}>
          <Image src={item.image} alt="" width={40} height={40} />
          <span><strong>{item.name}</strong><small>{item.species || "Desconhecido"} · #{id}</small>
            {origin && origin.toLowerCase() !== "unknown" && <small>Origem: {origin}</small>}
            {id === otherId && <small>Selecionado no outro lado</small>}
            {id === selectedId && <small>Selecionado neste lado</small>}</span>
        </li>;
      })}
    </ul>}
    {!pending && shown?.failed && <button className="button secondary" type="button" onClick={() => {
      setSearch({ ...shown, page: page - 1, failed: false });
      setAttempt(attempt + 1);
    }}>Tentar novamente</button>}
    {!pending && shown && !shown.failed && shown.page < shown.pages &&
      <button className="button secondary" type="button" onClick={() => setPage(page + 1)}>Carregar mais</button>}
  </div>;
}
