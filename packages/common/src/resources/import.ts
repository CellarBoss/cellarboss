import type {
  ImportCommit,
  ImportCommitResult,
  ImportPreview,
  ImportSite,
} from "@cellarboss/types";
import type { ApiResult, RequestFn } from "../types";

export function importResource(request: RequestFn) {
  return {
    sites: (): Promise<ApiResult<ImportSite[]>> =>
      request<ImportSite[]>("import/sites", "GET"),

    /** Reads a product page. */
    preview: (url: string): Promise<ApiResult<ImportPreview>> =>
      request<ImportPreview>("import/preview", "POST", JSON.stringify({ url })),

    commit: (data: ImportCommit): Promise<ApiResult<ImportCommitResult>> =>
      request<ImportCommitResult>(
        "import/commit",
        "POST",
        JSON.stringify(data),
      ),
  };
}
