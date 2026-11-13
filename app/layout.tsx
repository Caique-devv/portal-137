import type { Metadata } from "next";
import Link from "next/link";
import { Orbit, Radio } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Portal 137", template: "%s · Portal 137" },
  description: "Explore os personagens, episódios e dimensões de Rick and Morty.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>
    <a className="skip" href="#conteudo">Pular para o conteúdo</a>
    <header className="site-header"><div className="shell header-inner">
      <Link className="brand" href="/"><span><Orbit size={22} /></span>PORTAL<span className="brand-number">137</span></Link>
      <nav aria-label="Navegação principal"><Link href="/">Início</Link><Link href="/personagens">Personagens</Link><Link href="/favoritos">Favoritos</Link><Link href="/comparar">Comparar</Link><Link href="/cidadela">Cidadela</Link></nav>
      <div className="online"><Radio size={14} /> C-137</div>
    </div></header>
    <main id="conteudo" className="shell" tabIndex={-1}>{children}</main>
    <footer className="site-footer"><div className="shell footer-inner"><span>Portal 137 · Projeto de fã</span><a href="https://rickandmortyapi.com/">Dados da Rick and Morty API</a></div></footer>
  </body></html>;
}
