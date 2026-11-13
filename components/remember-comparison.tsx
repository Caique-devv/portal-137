"use client";

import { useEffect } from "react";
import { comparisonKey } from "@/lib/comparison";

export function RememberComparison({ a, b }: { a?: string; b?: string }) {
  useEffect(() => {
    try {
      const query = new URLSearchParams();
      if (a) query.set("a", a);
      if (b) query.set("b", b);
      sessionStorage.setItem(comparisonKey, query.toString());
    } catch {
      // The URL remains the source of truth when browser storage is unavailable.
    }
  }, [a, b]);
  return null;
}
