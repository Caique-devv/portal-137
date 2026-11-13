import { notFound } from "next/navigation";
import { batch, detail } from "@/lib/api";
import { Back, Cards } from "@/components/ui";

export default async function Episode({ params }: { params: Promise<{ id: string }> }) {
  const episode = await detail("episode", (await params).id);
  if (!episode) notFound();
  const cast = await batch("character", episode.characters);
  const date = new Date(episode.air_date);
  const formatted = Number.isNaN(date.valueOf()) ? episode.air_date : new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(date);
  return <section className="content"><Back /><p className="eyebrow">EPISÓDIO · {episode.episode}</p><h1>{episode.name}</h1>
    <p className="muted">Exibido em {formatted}</p>
    <h2 className="subheading">Elenco</h2>{cast.length ? <Cards characters={cast} /> : <p>Nenhum personagem registrado.</p>}
  </section>;
}
