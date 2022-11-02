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

export function numberToWord(cardinal: number) {
  const ordinals: Record<number, string> = {
    1: "st",
    2: "nd",
    3: "rd",
  };
  const digit = cardinal % 10;

  return `${cardinal}${ordinals[digit] ?? "th"}`;
}
