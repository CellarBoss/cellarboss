"use server";

import type {
  TastingNote,
  CreateTastingNote,
  UpdateTastingNote,
} from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";
import { api } from "./client";

export async function getTastingNotesByVintageId(
  vintageId: number,
): Promise<ApiResult<TastingNote[]>> {
  return api.tastingNotes.getByVintageId(vintageId);
}

export async function getTastingNotesByWineId(
  wineId: number,
): Promise<ApiResult<TastingNote[]>> {
  return api.tastingNotes.getByWineId(wineId);
}

export async function getTastingNoteById(
  id: number,
): Promise<ApiResult<TastingNote>> {
  return api.tastingNotes.getById(id);
}

export async function createTastingNote(
  data: CreateTastingNote,
): Promise<ApiResult<TastingNote>> {
  return api.tastingNotes.create(data);
}

export async function updateTastingNote(
  id: number,
  data: UpdateTastingNote,
): Promise<ApiResult<TastingNote>> {
  return api.tastingNotes.update(id, data);
}

export async function getAllTastingNotes(): Promise<ApiResult<TastingNote[]>> {
  return api.tastingNotes.getAll();
}

export async function deleteTastingNote(
  id: number,
): Promise<ApiResult<boolean>> {
  return api.tastingNotes.delete(id);
}
