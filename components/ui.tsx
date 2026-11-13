import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Character } from "@/lib/api";
import { CompareAction } from "./compare-action";
import { FavoriteButton } from "./favorites";

export function Status({ value }: { value: Character["status"] }) {
  return <span className={"status " + value.toLowerCase()}><i />{({ Alive: "Vivo", Dead: "Morto", unknown: "Desconhecido" })[value]}</span>;
}

export function Back({ href = "/personagens", children = "Personagens" }: { href?: string; children?: React.ReactNode }) {
  return <Link href={href} className="back"><ArrowLeft size={16} />{children}</Link>;
}

export function Cards({ characters, suffix = "", compare = false }: { characters: Character[]; suffix?: string; compare?: boolean }) {
  return <div className="cards">{characters.map((character) => (
    <article className="card" key={character.id}>
      <Link className="card-link" prefetch={false} href={`/personagens/${character.id}${suffix}`}>
        <Image src={character.image} alt="" width={300} height={300} sizes="(max-width: 620px) 48vw, 230px" />
        <div className="card-info"><Status value={character.status} /><h2>{character.name}</h2>
          <p>{character.species || "Desconhecido"} <ArrowUpRight size={16} aria-hidden="true" /></p></div>
      </Link>
      <FavoriteButton character={character} />
      {compare && <div className="card-actions"><CompareAction id={character.id} name={character.name} /></div>}
    </article>
  ))}</div>;
}

export function Empty({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="empty"><h2>{title}</h2>{children}</div>;
}
