export type Selection = { a?: string; b?: string; add?: string };
export const comparisonKey = "portal137:comparison";

export function comparisonHref({ a, b, add }: Selection) {
  const query = new URLSearchParams();
  if (a) query.set("a", a);
  if (b) query.set("b", b);
  if (add) query.set("add", add);
  return "/comparar" + (query.size ? "?" + query : "");
}
