import type {
  TastingNote,
  CreateTastingNote,
  UpdateTastingNote,
} from "@cellarboss/types";
import type { ApiResult, RequestFn } from "../types";

export function tastingNotesResource(request: RequestFn) {
  return {
    getAll: (): Promise<ApiResult<TastingNote[]>> =>
      request<TastingNote[]>("tasting-note", "GET"),

    getByVintageId: (vintageId: number): Promise<ApiResult<TastingNote[]>> =>
      request<TastingNote[]>("tasting-note/vintage/" + vintageId, "GET"),

    getByWineId: (wineId: number): Promise<ApiResult<TastingNote[]>> =>
      request<TastingNote[]>("tasting-note/wine/" + wineId, "GET"),

    getById: (id: number): Promise<ApiResult<TastingNote>> =>
      request<TastingNote>("tasting-note/" + id, "GET"),

    create: (data: CreateTastingNote): Promise<ApiResult<TastingNote>> =>
      request<TastingNote>(
        "tasting-note",
        "POST",
        JSON.stringify({
          vintageId: Number(data.vintageId),
          score: Number(data.score),
          notes: data.notes,
        }),
      ),

    update: (
      id: number,
      data: UpdateTastingNote,
    ): Promise<ApiResult<TastingNote>> =>
      request<TastingNote>("tasting-note/" + id, "PUT", JSON.stringify(data)),

    delete: (id: number): Promise<ApiResult<boolean>> =>
      request<boolean>("tasting-note/" + id, "DELETE"),
  };
}
