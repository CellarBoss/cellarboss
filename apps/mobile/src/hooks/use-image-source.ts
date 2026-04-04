import { useState, useEffect } from "react";
import { getApiBaseUrl } from "@/lib/api/base-url";
import { getToken } from "@/lib/auth/secure-store";
import { api } from "@/lib/api/client";

type ImageSource = { uri: string; headers: Record<string, string> };

type UseImageSourceResult = {
  thumbSource: (id: number) => ImageSource | null;
  fullSource: (id: number) => ImageSource | null;
};

export function useImageSource(): UseImageSourceResult {
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [authHeaders, setAuthHeaders] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadAuth() {
      const [url, token] = await Promise.all([getApiBaseUrl(), getToken()]);
      if (url) setBaseUrl(url);
      if (token) setAuthHeaders({ Authorization: `Bearer ${token}` });
    }
    loadAuth();
  }, []);

  return {
    thumbSource: (id: number) =>
      baseUrl
        ? {
            uri: `${baseUrl}/api/${api.images.getThumbUrl(id)}`,
            headers: authHeaders,
          }
        : null,
    fullSource: (id: number) =>
      baseUrl
        ? {
            uri: `${baseUrl}/api/${api.images.getImageUrl(id)}`,
            headers: authHeaders,
          }
        : null,
  };
}
