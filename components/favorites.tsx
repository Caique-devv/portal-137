"use client";

import { useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import { withCharacterName } from "@/lib/character-names";
import type { Character } from "@/lib/api";

const key = "portal137:favorites";
const eventName = "portal137:favorites-change";
const empty: Character[] = [];
let rawCache: string | null = null;
let cache = empty;
let memoryOnly = false;

function valid(value: unknown): value is Character {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Character>;
  return typeof item.id === "number" && Number.isSafeInteger(item.id) && item.id > 0
    && typeof item.name === "string" && typeof item.species === "string"
    && typeof item.image === "string" && /^https:\/\/rickandmortyapi\.com\/api\/character\/avatar\/\d+\.jpeg$/.test(item.image)
    && ["Alive", "Dead", "unknown"].includes(item.status ?? "");
}

function snapshot() {
  if (memoryOnly) return cache;
  try {
    const raw = localStorage.getItem(key);
    if (raw === rawCache) return cache;
    rawCache = raw;
    const parsed: unknown = JSON.parse(raw ?? "[]");
    cache = Array.isArray(parsed) ? [...new Map(parsed.filter(valid).map((item) => [item.id, withCharacterName(item)])).values()] : empty;
  } catch {
    cache = empty;
  }
  return cache;
}

function subscribe(update: () => void) {
  window.addEventListener(eventName, update);
  window.addEventListener("storage", update);
  return () => {
    window.removeEventListener(eventName, update);
    window.removeEventListener("storage", update);
  };
}

export function useFavorites() {
  return useSyncExternalStore(subscribe, snapshot, () => empty);
}

export function FavoriteButton({ character, expanded = false }: { character: Character; expanded?: boolean }) {
  const active = useFavorites().some(({ id }) => id === character.id);
  const label = active ? "Remover dos favoritos" : "Adicionar aos favoritos";
  function toggle() {
    const current = snapshot();
    const next = current.some(({ id }) => id === character.id)
      ? current.filter(({ id }) => id !== character.id)
      : [...current, character];
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      memoryOnly = true;
      cache = next;
    }
    window.dispatchEvent(new Event(eventName));
  }
  return <button type="button" className={expanded ? "button secondary" : "favorite"} aria-label={label + " · " + character.name}
    aria-pressed={active} onClick={toggle}><Heart size={18} fill={active ? "currentColor" : "none"} />{expanded && label}</button>;
}
