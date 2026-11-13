import Link from "next/link";

export default function NotFound() {
  return <section className="content"><p className="eyebrow">ERRO 404</p><h1>Registro não encontrado</h1>
    <p>Este endereço não corresponde a uma página disponível no Portal 137.</p><Link className="button primary" href="/personagens">Abrir catálogo</Link>
  </section>;
}
