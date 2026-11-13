import { connection } from "next/server";
import { batch, resourceId } from "@/lib/api";
import { CitadelArchive, type ArchiveEntry } from "@/components/citadel-archive";
import { episodeOrder } from "@/components/character-details";

export const metadata = { title: "Arquivo da Cidadela" };

const variants = {
  ricks: [1, 380, 285, 103, 8, 19, 119, 290],
  mortys: [2, 73, 85],
};

export default async function Citadel() {
  await connection();
  const ids = [...variants.ricks, ...variants.mortys];
  const characters = await batch("character", ids.map((id) => "https://rickandmortyapi.com/api/character/" + id));
  if (characters.length !== ids.length) throw new Error("Arquivo da Cidadela incompleto");
  const episodes = await batch("episode", characters.flatMap((character) => character.episode));
  const byId = new Map(episodes.map((episode) => [String(episode.id), episode]));
  const entries: ArchiveEntry[] = characters.map((character) => {
    const appearances = character.episode.flatMap((url) => {
      const episode = byId.get(resourceId(url, "episode") ?? "");
      return episode ? [episode] : [];
    });
    return {
      character,
      group: variants.ricks.includes(character.id) ? "ricks" : "mortys",
      first: appearances.sort(episodeOrder)[0],
    };
  });

  return <section className="content">
    <h1>Arquivo da Cidadela</h1>
    <CitadelArchive entries={entries} />
  </section>;
}
