"use server";

import type { Image } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";
import { api } from "./client";

export async function getImagesByVintageId(
  vintageId: number,
): Promise<ApiResult<Image[]>> {
  return api.images.getByVintageId(vintageId);
}

export async function deleteImage(id: number): Promise<ApiResult<boolean>> {
  return api.images.delete(id);
}

export async function setImageFavourite(id: number): Promise<ApiResult<Image>> {
  return api.images.setFavourite(id);
}

export async function unsetImageFavourite(
  id: number,
): Promise<ApiResult<Image>> {
  return api.images.unsetFavourite(id);
}
