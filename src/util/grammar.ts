export function pluralize({
  count,
  singular,
  plural,
}: {
  count: number;
  singular: string;
  plural?: string;
}) {
  if (count === 1) {
    return singular;
  }
  return plural || `${singular}s`;
}

export function possessive(word: string) {
  return `${word}'s`;
}
