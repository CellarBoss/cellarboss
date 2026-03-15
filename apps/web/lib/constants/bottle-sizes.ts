interface BottleSizeInfo {
  label: string;
  iconSize: number;
}

export const BOTTLE_SIZES: Record<string, BottleSizeInfo> = {
  piccolo: { label: "Piccolo (187ml)", iconSize: 20 },
  half: { label: "Half (375ml)", iconSize: 22 },
  standard: { label: "Standard (750ml)", iconSize: 24 },
  litre: { label: "Litre (1L)", iconSize: 26 },
  magnum: { label: "Magnum (1.5L)", iconSize: 28 },
  "double-magnum": { label: "Double Magnum (3L)", iconSize: 30 },
  jeroboam: { label: "Jeroboam (4.5L)", iconSize: 32 },
  imperial: { label: "Imperial (6L)", iconSize: 34 },
  salmanazar: { label: "Salmanazar (9L)", iconSize: 36 },
  balthazar: { label: "Balthazar (12L)", iconSize: 38 },
  nebuchadnezzar: { label: "Nebuchadnezzar (15L)", iconSize: 40 },
};
