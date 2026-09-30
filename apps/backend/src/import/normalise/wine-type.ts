import type { WineType } from "@cellarboss/validators";
import { foldKey } from "./text.js";

// Checked in order, so "Sparkling Rosé" is sparkling and "Rosé Port" is fortified.
const TYPE_KEYWORDS: [WineType, string[]][] = [
  [
    "sparkling",
    [
      "sparkling",
      "champagne",
      "cava",
      "prosecco",
      "cremant",
      "franciacorta",
      "sekt",
      "spumante",
      "fizz",
      "pet nat",
    ],
  ],
  [
    "fortified",
    ["fortified", "port", "sherry", "madeira", "marsala", "vin doux naturel"],
  ],
  [
    "dessert",
    [
      "dessert",
      "sweet",
      "sauternes",
      "tokaji",
      "ice wine",
      "icewine",
      "late harvest",
      "vin santo",
    ],
  ],
  ["rose", ["rose", "blush", "rosado", "rosato"]],
  ["orange", ["orange", "amber", "skin contact"]],
  ["red", ["red", "rouge", "tinto", "rosso"]],
  ["white", ["white", "blanc", "bianco", "blanco"]],
];

/** Maps a colour or style ("Rosé", "Tuscan Red", "Sparkling white") to a WineType. */
export function toWineType(value: string): WineType | undefined {
  const key = ` ${foldKey(value)} `;
  for (const [type, keywords] of TYPE_KEYWORDS) {
    if (keywords.some((keyword) => key.includes(` ${keyword} `))) return type;
  }
  return undefined;
}
