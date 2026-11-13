import { Suspense, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftRight, Diff } from "lucide-react";
import { batch, detail, resourceId, validId, type Character } from "@/lib/api";
import { comparisonHref, type Selection } from "@/lib/comparison";
import type { Query } from "@/lib/query";
import { CharacterPicker } from "@/components/character-picker";
import { RememberComparison } from "@/components/remember-comparison";
import { Status } from "@/components/ui";
import { EpisodeList, episodeOrder, genderLabel, PlaceLink, speciesLabel } from "@/components/character-details";

export const metadata = { title: "Comparar personagens" };

async function readCharacter(value: Query[string]) {
  if (value === undefined) return { character: null };
  if (typeof value !== "string" || !validId(value)) return { character: null, message: "O ID informado é inválido." };
  try {
    const character = await detail("character", value);
    return { character, message: character ? undefined : "Personagem não encontrado." };
  } catch {
    return { character: null, message: "Não foi possível carregar o personagem. Recarregue a página ou escolha outro.", unavailableId: value };
  }
}

async function CommonEpisodes({ a, b }: { a: Character; b: Character }) {
  const ids = new Set(b.episode.map((url) => resourceId(url, "episode")));
  const common = a.episode.filter((url) => {
    const id = resourceId(url, "episode");
    return id !== null && ids.has(id);
  });
  const episodes = await batch("episode", common).catch(() => null);
  if (!episodes) return <p role="alert">Não foi possível carregar os episódios em comum. Recarregue a página para tentar novamente.</p>;
  episodes.sort(episodeOrder);
  return episodes.length ? <EpisodeList episodes={episodes} /> :
    <p>Esses personagens não aparecem juntos em nenhum episódio do catálogo.</p>;
}

const fields: { label: string; value: (character: Character) => ReactNode; key: (character: Character) => string | number }[] = [
  { label: "Status", value: (c) => <Status value={c.status} />, key: (c) => c.status },
  { label: "Espécie", value: (c) => speciesLabel(c.species), key: (c) => speciesLabel(c.species) },
  { label: "Gênero", value: (c) => genderLabel(c.gender), key: (c) => c.gender },
  { label: "Origem", value: (c) => <PlaceLink place={c.origin} />, key: (c) => c.origin.url || c.origin.name },
  { label: "Última localização conhecida", value: (c) => <PlaceLink place={c.location} />, key: (c) => c.location.url || c.location.name },
  { label: "Total de episódios", value: (c) => c.episode.length, key: (c) => c.episode.length },
];

export default async function Compare({ searchParams }: { searchParams: Promise<Query> }) {
  const params = await searchParams;
  const duplicate = params.a !== undefined && params.a === params.b && typeof params.a === "string" && validId(params.a);
  const [left, right, incoming] = await Promise.all([
    readCharacter(params.a),
    readCharacter(duplicate ? undefined : params.b),
    readCharacter(params.add),
  ]);
  const sides = { a: left, b: right };
  const a = left.character;
  const b = right.character;
  const selection: Selection = {
    a: a ? String(a.id) : left.unavailableId,
    b: b ? String(b.id) : right.unavailableId,
  };
  const candidate = incoming.character;
  const candidateId = candidate ? String(candidate.id) : undefined;
  const extra = candidate && candidateId !== selection.a && candidateId !== selection.b ? candidate : null;
  const openSide = !a ? "a" : !b ? "b" : null;
  if (extra && openSide) redirect(comparisonHref({ ...selection, [openSide]: candidateId }));
  const first = sides.a.character;
  const second = sides.b.character;
  const replacement = extra && !openSide ? extra : null;

  return <section className="content compare">
    <RememberComparison a={selection.a} b={selection.b} />
    <h1>Comparar personagens</h1>
    {duplicate && <p role="status">Escolha dois IDs diferentes para comparar.</p>}
    {incoming.message && <p role="alert">{incoming.message}</p>}
    {replacement && <section className="compare-replace" aria-labelledby="replace-title">
      <h2 id="replace-title">Quem você quer substituir por {replacement.name} (#{replacement.id})?</h2>
      <div className="compare-controls">
        <Link className="button primary" href={comparisonHref({ ...selection, a: String(replacement.id) })}>Substituir A · {first?.name}</Link>
        <Link className="button primary" href={comparisonHref({ ...selection, b: String(replacement.id) })}>Substituir B · {second?.name}</Link>
        <Link className="button secondary" href={comparisonHref(selection)}>Cancelar</Link>
      </div>
    </section>}
    <div className="compare-pair">
      {(["a", "b"] as const).map((side) => {
        const { character, message } = sides[side];
        const label = side.toUpperCase();
        return <section className="compare-slot" key={side} aria-labelledby={"side-" + side}>
          <h2 id={"side-" + side}>Personagem {label}</h2>
          {character ? <Link className="compare-profile" href={"/personagens/" + character.id} prefetch={false}>
            <Image src={character.image} alt="" width={160} height={160} sizes="(max-width: 660px) 35vw, 160px" />
            <strong>{character.name}</strong><small>#{character.id} · Ver perfil</small>
          </Link> : <p className="muted">Busque pelo nome e escolha um personagem.</p>}
          {message && <p role="status">{message}</p>}
          {selection[side] && <Link className="button secondary" aria-label={"Remover personagem " + label}
            href={comparisonHref({ ...selection, [side]: undefined })} scroll={false}>Remover</Link>}
          <CharacterPicker side={side} selection={selection} selectedName={character?.name} />
        </section>;
      })}
    </div>
    {first && second && <>
      <Link className="button secondary compare-swap" href={comparisonHref({ a: selection.b, b: selection.a })} scroll={false}>
        <ArrowLeftRight size={16} aria-hidden="true" /> Inverter personagens
      </Link>
      <table className="compare-table" role="table">
        <caption>Dados dos personagens</caption>
        <thead role="rowgroup"><tr role="row">
          <th scope="col" role="columnheader" className="compare-feature-heading">Característica</th>
          <th scope="col" role="columnheader">A · {first.name}</th>
          <th scope="col" role="columnheader">B · {second.name}</th>
        </tr></thead>
        <tbody role="rowgroup">
          {fields.map((field) => {
            const different = field.key(first) !== field.key(second);
            return <tr key={field.label} role="row" className={different ? "compare-different" : undefined}>
              <th scope="row" role="rowheader">{field.label}
                {different && <Diff className="compare-difference" size={15} role="img" aria-label="Característica diferente" />}
              </th>
              <td role="cell">{field.value(first)}</td>
              <td role="cell">{field.value(second)}</td>
            </tr>;
          })}
        </tbody>
      </table>
      <section aria-labelledby="common-title">
        <h2 className="subheading" id="common-title">Episódios em comum</h2>
        <Suspense key={first.id + ":" + second.id} fallback={<p role="status">Carregando episódios em comum…</p>}>
          <CommonEpisodes a={first} b={second} />
        </Suspense>
      </section>
    </>}
  </section>;
}
