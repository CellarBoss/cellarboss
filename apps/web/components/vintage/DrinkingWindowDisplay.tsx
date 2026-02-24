import { Check, Hourglass, AlertCircle } from "lucide-react";
import {
  formatDrinkingWindow,
  formatDrinkingStatus,
} from "@/lib/functions/format";

export function DrinkingWindowDisplay({
  drinkFrom,
  drinkUntil,
}: {
  drinkFrom: number | null;
  drinkUntil: number | null;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <span className="flex items-center gap-2">
      {(() => {
        const status = formatDrinkingStatus(drinkFrom, drinkUntil, currentYear);
        switch (status) {
          case "drinkable":
            return (
              <Check className="inline-block h-3.5 w-3.5 text-green-500" />
            );
          case "wait":
            return (
              <Hourglass className="inline-block h-3.5 w-3.5 text-yellow-500" />
            );
          case "past":
            return (
              <AlertCircle className="inline-block h-3.5 w-3.5 text-red-500" />
            );
        }
      })()}{" "}
      {formatDrinkingWindow(drinkFrom, drinkUntil)}
    </span>
  );
}
