"use client";

import Link from "next/link";
import { Cards, Empty } from "@/components/ui";
import { useFavorites } from "@/components/favorites";

export default function Favorites() {
  const favorites = useFavorites();
  return <section className="content"><p className="eyebrow">COLEÇÃO PESSOAL</p><h1>Favoritos</h1>
    {favorites.length ? <Cards characters={favorites} /> : <Empty title="Sua lista está vazia">
      <p>Use o coração para salvar seus personagens favoritos.</p><Link className="button primary" href="/personagens">Abrir catálogo</Link>
    </Empty>}
  </section>;
}
