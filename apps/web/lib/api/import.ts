"use server";

import type {
  ImportCommit,
  ImportCommitResult,
  ImportPreview,
} from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";
import { api } from "./client";

export async function previewImport(
  url: string,
): Promise<ApiResult<ImportPreview>> {
  return api.import.preview(url);
}

export async function commitImport(
  data: ImportCommit,
): Promise<ApiResult<ImportCommitResult>> {
  return api.import.commit(data);
}
