import Image from "next/image";
import { CompareAction } from "@/components/compare-action";
import { EpisodeList, genderLabel, PlaceLink } from "@/components/character-details";
import { notFound } from "next/navigation";
import { batch, detail } from "@/lib/api";
import { catalogHref, readQuery, type Query } from "@/lib/query";
import { Back, Status } from "@/components/ui";
import { FavoriteButton } from "@/components/favorites";

export default async function Profile({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Query> }) {
  const { id } = await params;
  const character = await detail("character", id);
  if (!character) notFound();
  const episodes = await batch("episode", character.episode);
  const back = catalogHref(readQuery(await searchParams));

  return <section className="content">
    <Back href={back} />
    <div className="profile">
      <Image src={character.image} alt={character.name} width={300} height={300} preload />
      <div><p className="eyebrow">REGISTRO DE PERSONAGEM</p><h1>{character.name}</h1>
        <Status value={character.status} />
        <dl className="facts"><div><dt>Espécie</dt><dd>{character.species || "Desconhecido"}</dd></div>
          <div><dt>Gênero</dt><dd>{genderLabel(character.gender)}</dd></div>
          <div><dt>Origem</dt><dd><PlaceLink place={character.origin} /></dd></div>
          <div><dt>Última localização conhecida</dt><dd><PlaceLink place={character.location} /></dd></div></dl>
        <div className="compare-controls"><FavoriteButton character={character} expanded /><CompareAction id={character.id} name={character.name} /></div>
      </div>
    </div>
    <h2 className="subheading">Episódios</h2>
    {episodes.length ? <EpisodeList episodes={episodes} /> : <p>Nenhum episódio registrado.</p>}
  </section>;
}
