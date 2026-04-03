import type { Image } from "@cellarboss/types";
import type { ApiResult, RequestFn } from "../types";

export function imagesResource(request: RequestFn) {
  return {
    getByVintageId: (vintageId: number): Promise<ApiResult<Image[]>> =>
      request<Image[]>("image/vintage/" + vintageId, "GET"),

    delete: (id: number): Promise<ApiResult<boolean>> =>
      request<boolean>("image/" + id, "DELETE"),

    // URL helpers — clients prepend their base API URL
    getImageUrl: (id: number): string => "image/" + id + "/file",
    getThumbUrl: (id: number): string => "image/" + id + "/thumb",
  };
}
