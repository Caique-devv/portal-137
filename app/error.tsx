"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const router = useRouter();
  return <section className="content"><h1>Falha na comunicação</h1><p>A Rick and Morty API está temporariamente indisponível. Tente novamente.</p>
    <button className="button primary" onClick={() => startTransition(() => { router.refresh(); reset(); })}>Tentar novamente</button>
  </section>;
}
