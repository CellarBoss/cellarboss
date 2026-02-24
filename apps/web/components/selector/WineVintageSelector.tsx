"use client";

import { useState, useEffect } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Wine, WineMaker, Vintage } from "@cellarboss/types";
import { useApiQuery } from "@/hooks/use-api-query";
import { getWines } from "@/lib/api/wines";
import { getWinemakers } from "@/lib/api/winemakers";
import { getVintages } from "@/lib/api/vintages";

type WineVintageSelectorProps = {
  field: any;
  editable: boolean;
};

export function WineVintageSelector({
  field,
  editable,
}: WineVintageSelectorProps) {
  const currentVintageId = field.state.value ?? "";

  const { data: wines, isLoading: winesLoading } = useApiQuery<Wine[]>({
    queryKey: ["wines"],
    queryFn: getWines,
  });
  const { data: winemakers, isLoading: winemakersLoading } = useApiQuery<
    WineMaker[]
  >({
    queryKey: ["winemakers"],
    queryFn: getWinemakers,
  });
  const { data: vintages, isLoading: vintagesLoading } = useApiQuery<Vintage[]>(
    {
      queryKey: ["vintages"],
      queryFn: getVintages,
    },
  );

  const [selectedWineId, setSelectedWineId] = useState<number | null>(null);
  const [wineOpen, setWineOpen] = useState(false);
  const [vintageOpen, setVintageOpen] = useState(false);

  // Pre-populate wine from existing vintageId (edit mode)
  useEffect(() => {
    if (currentVintageId && vintages && selectedWineId === null) {
      const vintage = vintages.find(
        (v) => v.id.toString() === currentVintageId,
      );
      if (vintage) setSelectedWineId(vintage.wineId);
    }
  }, [vintages, currentVintageId, selectedWineId]);

  if (winesLoading || winemakersLoading || vintagesLoading) {
    return <span className="text-sm text-muted-foreground">Loading...</span>;
  }

  if (!wines || !winemakers || !vintages) {
    throw new Error("Failed to load wines or vintages");
  }

  const selectedWine = wines.find((w) => w.id === selectedWineId);
  const selectedVintage = vintages.find(
    (v) => v.id.toString() === currentVintageId,
  );
  const filteredVintages = selectedWineId
    ? vintages.filter((v) => v.wineId === selectedWineId)
    : [];

  // Non-editable: display resolved name
  if (!editable) {
    const selectedWinemaker = selectedWine
      ? winemakers.find((wm) => wm.id === selectedWine.wineMakerId)
      : null;
    const displayName =
      selectedWine && selectedVintage
        ? `${selectedWinemaker ? selectedWinemaker.name + " - " : ""}${selectedWine.name} ${selectedVintage.year ?? "NV"}`
        : null;
    return (
      <div className="flex min-h-9 items-center px-3 py-2 border rounded-md bg-muted text-sm">
        {displayName ?? <span className="text-muted-foreground">None</span>}
      </div>
    );
  }

  // Build winemaker groups for the wine selector
  const winemakersWithWines = winemakers.filter((wm) =>
    wines.some((w) => w.wineMakerId === wm.id),
  );

  function handleWineSelect(wineId: number) {
    if (wineId === selectedWineId) {
      setSelectedWineId(null);
    } else {
      setSelectedWineId(wineId);
    }
    field.handleChange(""); // clear vintage when wine changes
    setWineOpen(false);
  }

  function handleVintageSelect(vintageId: number) {
    const id = vintageId.toString();
    field.handleChange(id === currentVintageId ? "" : id);
    setVintageOpen(false);
  }

  return (
    <div className="space-y-2">
      {/* Wine selector grouped by winemaker */}
      <Popover open={wineOpen} onOpenChange={setWineOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            type="button"
            aria-expanded={wineOpen}
            className="w-full justify-between font-normal"
          >
            {selectedWine ? selectedWine.name : "Choose a wine..."}
            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="min-w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search wines..." />
            <CommandList>
              <CommandEmpty>No wines found.</CommandEmpty>
              {winemakersWithWines.map((wm) => {
                const wmWines = wines.filter((w) => w.wineMakerId === wm.id);
                return (
                  <CommandGroup key={wm.id} heading={wm.name}>
                    {wmWines.map((wine) => (
                      <CommandItem
                        key={wine.id}
                        value={wine.name}
                        onSelect={() => handleWineSelect(wine.id)}
                      >
                        {wine.name}
                        <CheckIcon
                          className={cn(
                            "ml-auto size-4",
                            selectedWineId === wine.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Vintage year selector — only shown once a wine is selected */}
      {selectedWineId !== null && (
        <Popover open={vintageOpen} onOpenChange={setVintageOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              type="button"
              aria-expanded={vintageOpen}
              className="w-full justify-between font-normal"
            >
              {selectedVintage
                ? (selectedVintage.year?.toString() ?? "NV")
                : "Choose a vintage year..."}
              <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="min-w-[--radix-popover-trigger-width] p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder="Search years..." />
              <CommandList>
                <CommandEmpty>No vintages found for this wine.</CommandEmpty>
                <CommandGroup>
                  {filteredVintages
                    .slice()
                    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
                    .map((vintage) => {
                      const id = vintage.id.toString();
                      return (
                        <CommandItem
                          key={vintage.id}
                          value={vintage.year?.toString() ?? "NV"}
                          onSelect={() => handleVintageSelect(vintage.id)}
                        >
                          {vintage.year ?? "NV"}
                          <CheckIcon
                            className={cn(
                              "ml-auto size-4",
                              currentVintageId === id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      );
                    })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
