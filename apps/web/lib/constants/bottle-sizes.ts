import { BOTTLE_SIZE_LABELS } from "@cellarboss/common/constants";

interface BottleSizeInfo {
  label: string;
  iconSize: number;
}

export const BOTTLE_SIZES: Record<string, BottleSizeInfo> = {
  piccolo: { label: BOTTLE_SIZE_LABELS["piccolo"], iconSize: 20 },
  half: { label: BOTTLE_SIZE_LABELS["half"], iconSize: 22 },
  standard: { label: BOTTLE_SIZE_LABELS["standard"], iconSize: 24 },
  litre: { label: BOTTLE_SIZE_LABELS["litre"], iconSize: 26 },
  magnum: { label: BOTTLE_SIZE_LABELS["magnum"], iconSize: 28 },
  "double-magnum": { label: BOTTLE_SIZE_LABELS["double-magnum"], iconSize: 30 },
  jeroboam: { label: BOTTLE_SIZE_LABELS["jeroboam"], iconSize: 32 },
  imperial: { label: BOTTLE_SIZE_LABELS["imperial"], iconSize: 34 },
  salmanazar: { label: BOTTLE_SIZE_LABELS["salmanazar"], iconSize: 36 },
  balthazar: { label: BOTTLE_SIZE_LABELS["balthazar"], iconSize: 38 },
  nebuchadnezzar: { label: BOTTLE_SIZE_LABELS["nebuchadnezzar"], iconSize: 40 },
};
