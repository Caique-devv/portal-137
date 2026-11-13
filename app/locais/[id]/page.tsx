import { notFound } from "next/navigation";
import { batch, detail } from "@/lib/api";
import { Back, Cards } from "@/components/ui";

function known(value: string) {
  return value && value.toLowerCase() !== "unknown" ? value : "Desconhecido";
}

export default async function Location({ params }: { params: Promise<{ id: string }> }) {
  const place = await detail("location", (await params).id);
  if (!place) notFound();
  const residents = await batch("character", place.residents);
  return <section className="content"><Back /><p className="eyebrow">REGISTRO DE LOCAL</p><h1>{place.name}</h1>
    <dl className="facts"><div><dt>Tipo</dt><dd>{known(place.type)}</dd></div><div><dt>Dimensão</dt><dd>{known(place.dimension)}</dd></div></dl>
    <h2 className="subheading">Residentes conhecidos</h2>{residents.length ? <Cards characters={residents} /> : <p>Nenhum residente conhecido neste local.</p>}
  </section>;
}
