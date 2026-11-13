"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { comparisonHref, comparisonKey } from "@/lib/comparison";

export function CompareAction({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const href = comparisonHref({ a: String(id) });

  return <Link className="button secondary compare-action" href={href} prefetch={false} aria-label={"Comparar " + name}
    onNavigate={(event) => {
      try {
        const saved = new URLSearchParams(sessionStorage.getItem(comparisonKey) ?? "");
        const a = saved.get("a") ?? undefined;
        const b = saved.get("b") ?? undefined;
        if (!a && !b) return;
        event.preventDefault();
        router.push(comparisonHref({ a, b, add: String(id) }));
      } catch {
        // The link still opens a comparison when browser storage is unavailable.
      }
    }}>Comparar</Link>;
}
