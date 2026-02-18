"use client";

import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { scrapeAndResolve } from "@/lib/api/import";
import type { ImportPreview } from "@/lib/api/import";

const SUPPORTED_PROVIDERS = [
  "nakedwines.co.uk",
  "nakedwines.com",
  "thewinesociety.com",
  "vivino.com",
];

type UrlInputStepProps = {
  onScraped: (preview: ImportPreview) => void;
};

export function UrlInputStep({ onScraped }: UrlInputStepProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleScrape() {
    const trimmed = url.trim();
    if (!trimmed) return;

    setError(null);
    setLoading(true);
    try {
      const result = await scrapeAndResolve(trimmed);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onScraped(result.data);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleScrape();
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Paste a product URL from a supported wine merchant. The page will be
          scraped to pre-fill the wine details.
        </p>

        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://www.nakedwines.co.uk/wines/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleScrape}
            disabled={loading || !url.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Scraping...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <SearchIcon className="size-4" />
                Scrape
              </span>
            )}
          </Button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Supported providers
        </p>
        <ul className="text-sm text-muted-foreground space-y-1">
          {SUPPORTED_PROVIDERS.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground italic">
          Launching browser and scraping page — this may take a few seconds...
        </p>
      )}
    </div>
  );
}
