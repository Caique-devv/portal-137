import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { resourceId, type Episode, type Place } from "@/lib/api";

export function genderLabel(gender: string) {
  const labels: Record<string, string> = { Female: "Feminino", Male: "Masculino", Genderless: "Sem gênero" };
  return labels[gender] ?? "Desconhecido";
}

export function placeName(place: Place) {
  return place.name && place.name.toLowerCase() !== "unknown" ? place.name : "Desconhecido";
}

export function speciesLabel(species: string) {
  const labels = new Map([
    ["Human", "Humano"], ["Humanoid", "Humanoide"], ["Animal", "Animal"], ["Alien", "Alienígena"],
    ["Robot", "Robô"], ["Mythological Creature", "Criatura mitológica"], ["Disease", "Doença"],
    ["Cronenberg", "Cronenberg"], ["Poopybutthole", "Poopybutthole"], ["unknown", "Desconhecido"],
  ]);
  return labels.get(species) ?? (species || "Desconhecido");
}

export function episodeOrder(first: Episode, second: Episode) {
  return first.episode.localeCompare(second.episode, "en", { numeric: true });
}

export function PlaceLink({ place }: { place: Place }) {
  const id = resourceId(place.url, "location");
  const name = placeName(place);
  return id ? <Link href={`/locais/${id}`}>{name} <ArrowUpRight size={14} aria-hidden="true" /></Link> : name;
}

export function EpisodeList({ episodes }: { episodes: Episode[] }) {
  return <ul className="episode-list">{episodes.map((episode) => (
    <li key={episode.id}><Link prefetch={false} href={`/episodios/${episode.id}`}>
      <span>{episode.episode}</span>{episode.name}<ArrowUpRight size={17} aria-hidden="true" />
    </Link></li>
  ))}</ul>;
}
