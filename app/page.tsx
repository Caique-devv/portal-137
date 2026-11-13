import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Portal } from "@/components/portal";
import { Cards } from "@/components/ui";
import { catalog } from "@/lib/api";

async function FeaturedCharacters() {
  await connection();
  const preview = await catalog().catch(() => null);
  return preview ? <Cards characters={preview.results.slice(0, 5)} /> : <p>Os destaques estão temporariamente indisponíveis.</p>;
}

export default function Home() {
  return <>
    <section className="hero">
      <div className="hero-copy">
        <h1>Portal <em>137</em></h1>
        <p className="hero-description">Explore os personagens, episódios e dimensões do universo de Rick and Morty.</p>
        <div className="actions"><Link className="button primary" href="/personagens">Explorar personagens <ArrowRight size={18} /></Link><Portal /></div>
      </div>
    </section>
    <section className="featured" aria-labelledby="featured">
      <div className="section-head"><div><p className="eyebrow"><ArrowDown size={14} /> ARQUIVOS DA CIDADELA</p><h2 id="featured">Personagens em destaque</h2></div><Link className="back" href="/personagens">Ver catálogo <ArrowRight size={16} /></Link></div>
      <Suspense fallback={<p role="status">Carregando destaques…</p>}><FeaturedCharacters /></Suspense>
    </section>
  </>;
}
