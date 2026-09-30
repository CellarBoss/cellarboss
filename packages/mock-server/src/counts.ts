import type {
  BottleCounts,
  Vintage,
  VintageDetail,
  Wine,
  WineDetail,
} from "@cellarboss/types";
import { BOTTLE_STATUSES } from "@cellarboss/validators";
import type { MockState } from "./index";

// Mirrors the backend read models, which embed counts in GET responses

export function toWineDetail(state: MockState, wine: Wine): WineDetail {
  const vintageIds = new Set(
    state.vintages.filter((v) => v.wineId === wine.id).map((v) => v.id),
  );
  return {
    ...wine,
    tastingNotesCount: state.tastingNotes.filter((n) =>
      vintageIds.has(n.vintageId),
    ).length,
  };
}

export function toVintageDetail(
  state: MockState,
  vintage: Vintage,
): VintageDetail {
  const bottles = Object.fromEntries(
    BOTTLE_STATUSES.map((status) => [status, 0]),
  ) as BottleCounts;
  for (const bottle of state.bottles) {
    if (bottle.vintageId === vintage.id) bottles[bottle.status]++;
  }
  return {
    ...vintage,
    tastingNotesCount: state.tastingNotes.filter(
      (n) => n.vintageId === vintage.id,
    ).length,
    bottles,
  };
}
