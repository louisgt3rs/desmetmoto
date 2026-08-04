const COLOR_KEYWORDS: Array<[string, string]> = [
  ["white", "#f5f5f0"], ["blanc", "#f5f5f0"],
  ["black", "#1a1a1a"], ["noir", "#1a1a1a"],
  ["yellow", "#e8b923"], ["jaune", "#e8b923"],
  ["red", "#c0392b"], ["rouge", "#c0392b"],
  ["blue", "#2e5fa3"], ["bleu", "#2e5fa3"],
  ["green", "#3a7d44"], ["vert", "#3a7d44"],
  ["orange", "#d97b29"],
  ["silver", "#b8b8b8"], ["argent", "#b8b8b8"],
  ["grey", "#8a8a8a"], ["gray", "#8a8a8a"], ["gris", "#8a8a8a"],
  ["gold", "#c9973a"], ["doré", "#c9973a"], ["dore", "#c9973a"],
  ["pink", "#d67a9e"], ["rose", "#d67a9e"],
  ["purple", "#7c4a9e"], ["violet", "#7c4a9e"],
  ["brown", "#6b4a30"], ["marron", "#6b4a30"], ["brun", "#6b4a30"],
];

const FALLBACK_HEX = "#6b6b6b";

export function colorNameToHex(name: string): string {
  const lower = name.toLowerCase();
  for (const [keyword, hex] of COLOR_KEYWORDS) {
    if (lower.includes(keyword)) return hex;
  }
  return FALLBACK_HEX;
}
