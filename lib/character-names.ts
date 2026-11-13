export const characterNames = new Map([
  [380, { original: "Unknown Rick", corrected: "Rick Prime" }],
  [285, { original: "Rick Prime", corrected: "Zeta Alpha Rick" }],
]);

export function withCharacterName<T extends { id: number; name: string }>(character: T): T {
  const name = characterNames.get(character.id)?.corrected;
  return name && name !== character.name ? { ...character, name } : character;
}
