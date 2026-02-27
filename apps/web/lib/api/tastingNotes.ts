"use server";

import type {
  TastingNote,
  CreateTastingNote,
  UpdateTastingNote,
} from "@cellarboss/types";
import type { ApiResult } from "./types";
import { makeServerRequest } from "./server";

export async function getTastingNotesByVintageId(
  vintageId: number,
): Promise<ApiResult<TastingNote[]>> {
  return makeServerRequest<TastingNote[]>(
    "tasting-note/vintage/" + vintageId,
    "GET",
  );
}

export async function getTastingNotesByWineId(
  wineId: number,
): Promise<ApiResult<TastingNote[]>> {
  return makeServerRequest<TastingNote[]>("tasting-note/wine/" + wineId, "GET");
}

export async function getTastingNoteById(
  id: number,
): Promise<ApiResult<TastingNote>> {
  return makeServerRequest<TastingNote>("tasting-note/" + id, "GET");
}

export async function createTastingNote(
  data: CreateTastingNote,
): Promise<ApiResult<TastingNote>> {
  return makeServerRequest<TastingNote>(
    "tasting-note",
    "POST",
    JSON.stringify({
      vintageId: Number(data.vintageId),
      score: Number(data.score),
      notes: data.notes,
    }),
  );
}

export async function updateTastingNote(
  id: number,
  data: UpdateTastingNote,
): Promise<ApiResult<TastingNote>> {
  return makeServerRequest<TastingNote>(
    "tasting-note/" + id,
    "PUT",
    JSON.stringify(data),
  );
}

export async function deleteTastingNote(
  id: number,
): Promise<ApiResult<boolean>> {
  return makeServerRequest<boolean>("tasting-note/" + id, "DELETE");
}
