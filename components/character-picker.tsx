"use client";

import { useRouter } from "next/navigation";
import { comparisonHref, type Selection } from "@/lib/comparison";
import { CharacterSuggestions } from "./character-suggestions";

export function CharacterPicker({ side, selection, selectedName }: {
  side: "a" | "b";
  selection: Selection;
  selectedName?: string;
}) {
  const router = useRouter();
  return <CharacterSuggestions key={selection[side] ?? ""}
    inputId={"compare-" + side} listId={"compare-options-" + side}
    label={(selectedName ? "Trocar" : "Buscar") + " personagem " + side.toUpperCase()}
    initialValue={selectedName} selectedId={selection[side]} otherId={selection[side === "a" ? "b" : "a"]}
    onChoose={(item) => router.push(comparisonHref({ ...selection, [side]: String(item.id), add: undefined }), { scroll: false })} />;
}
