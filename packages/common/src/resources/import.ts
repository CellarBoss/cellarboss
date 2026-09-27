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

    /** Reads a product page. `html` sends the page from the user's own browser instead. */
    preview: (url: string, html?: string): Promise<ApiResult<ImportPreview>> =>
      request<ImportPreview>(
        "import/preview",
        "POST",
        JSON.stringify(html === undefined ? { url } : { url, html }),
      ),

    commit: (data: ImportCommit): Promise<ApiResult<ImportCommitResult>> =>
      request<ImportCommitResult>(
        "import/commit",
        "POST",
        JSON.stringify(data),
      ),
  };
}
