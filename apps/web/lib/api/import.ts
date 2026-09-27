"use server";

import type {
  ImportCommit,
  ImportCommitResult,
  ImportPreview,
  ImportSite,
} from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";
import { api } from "./client";

export async function getImportSites(): Promise<ApiResult<ImportSite[]>> {
  return api.import.sites();
}

export async function previewImport(
  url: string,
  html?: string,
): Promise<ApiResult<ImportPreview>> {
  return api.import.preview(url, html);
}

export async function commitImport(
  data: ImportCommit,
): Promise<ApiResult<ImportCommitResult>> {
  return api.import.commit(data);
}
