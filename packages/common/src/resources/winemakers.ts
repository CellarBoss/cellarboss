import type { WineMaker } from "@cellarboss/types";
import type { ApiResult, RequestFn } from "../types";

export function winemakersResource(request: RequestFn) {
  return {
    getAll: (): Promise<ApiResult<WineMaker[]>> =>
      request<WineMaker[]>("winemaker", "GET"),

    getById: (id: number): Promise<ApiResult<WineMaker>> =>
      request<WineMaker>("winemaker/" + id, "GET"),

    create: (winemaker: WineMaker): Promise<ApiResult<WineMaker>> =>
      request<WineMaker>("winemaker", "POST", JSON.stringify(winemaker)),

    update: (winemaker: WineMaker): Promise<ApiResult<WineMaker>> =>
      request<WineMaker>(
        "winemaker/" + winemaker.id,
        "PUT",
        JSON.stringify(winemaker),
      ),

    delete: (id: number): Promise<ApiResult<boolean>> =>
      request<boolean>("winemaker/" + id, "DELETE"),
  };
}
