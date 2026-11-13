"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Orbit } from "lucide-react";

export function Portal() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function open() {
    setState("loading");
    try {
      const response = await fetch("/api/portal", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const { id } = await response.json();
      router.push("/personagens/" + id);
    } catch {
      setState("error");
    }
  }

  return <div>
    <button className="button secondary portal-trigger" type="button" disabled={state === "loading"} onClick={open}>
      {state === "loading" ? <LoaderCircle className="spin" size={18} /> : <Orbit size={18} />}
      {state === "loading" ? "Abrindo portal…" : state === "error" ? "Tentar novamente" : "Abrir portal"}
    </button>
    {state === "error" && <p className="portal-error" role="alert">Falha ao abrir o portal.</p>}
  </div>;
}
