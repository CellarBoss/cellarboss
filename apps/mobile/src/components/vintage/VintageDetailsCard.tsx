import { View, Pressable, StyleSheet } from "react-native";
import { Text, Icon } from "react-native-paper";
import { useRouter } from "expo-router";
import { shadows } from "@/lib/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import {
  formatDrinkingWindow,
  formatDrinkingStatus,
} from "@/lib/functions/format";
import {
  getDrinkingStatusColors,
  DRINKING_STATUS_ICONS,
} from "@/lib/constants/drinking-status";
import { WineThumbnail } from "@/components/wine/WineThumbnail";

type VintageDetailsCardProps = {
  vintageId: number;
  onPress?: () => void;
};

export function VintageDetailsCard({
  vintageId,
  onPress,
}: VintageDetailsCardProps) {
  const theme = useAppTheme();
  const router = useRouter();

  const imagesQuery = useApiQuery({
    queryKey: ["images", vintageId],
    queryFn: () => api.images.getByVintageId(vintageId),
  });

  const vintageQuery = useApiQuery({
    queryKey: ["vintages", vintageId],
    queryFn: () => api.vintages.getById(vintageId),
  });
  const winesQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: () => api.wines.getAll(),
  });
  const winemakersQuery = useApiQuery({
    queryKey: ["winemakers"],
    queryFn: () => api.winemakers.getAll(),
  });
  const regionsQuery = useApiQuery({
    queryKey: ["regions"],
    queryFn: () => api.regions.getAll(),
  });
  const countriesQuery = useApiQuery({
    queryKey: ["countries"],
    queryFn: () => api.countries.getAll(),
  });

  const result = queryGate([
    vintageQuery,
    winesQuery,
    winemakersQuery,
    regionsQuery,
    countriesQuery,
  ]);
  if (!result.ready) return result.gate;

  const [vintage, wines, winemakers, regions, countries] = result.data;

  const wine = wines.find((w) => w.id === vintage.wineId);
  const winemaker = wine
    ? winemakers.find((m) => m.id === wine.wineMakerId)
    : undefined;
  const region = wine?.regionId
    ? regions.find((r) => r.id === wine.regionId)
    : undefined;
  const country = region?.countryId
    ? countries.find((c) => c.id === region.countryId)
    : undefined;

  const wineType = wine?.type;

  const currentYear = new Date().getFullYear();
  const drinkingStatus = formatDrinkingStatus(
    vintage.drinkFrom,
    vintage.drinkUntil,
    currentYear,
  );
  const drinkingWindow = formatDrinkingWindow(
    vintage.drinkFrom,
    vintage.drinkUntil,
  );
  const drinkingIcon = DRINKING_STATUS_ICONS[drinkingStatus];

  const wineName = wine?.name ?? "Unknown Wine";
  const yearLabel = vintage.year != null ? String(vintage.year) : "NV";

  const images = imagesQuery.data ?? [];
  const thumbnailImage =
    images.find((i) => i.isFavourite) ?? images[images.length - 1];

  const styles = StyleSheet.create({
    heading: {
      color: theme.colors.onSurface,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      ...shadows.card,
    },
    row: {
      flexDirection: "row" as const,
      alignItems: "flex-start" as const,
      gap: 12,
    },
    details: {
      flex: 1,
      gap: 4,
    },
    detailRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 6,
      marginTop: 2,
    },
    detailText: {
      flex: 1,
      color: theme.colors.onSurfaceVariant,
    },
    linkText: {
      color: theme.colors.primary,
    },
  });

  return (
    <>
      <Text variant="titleSmall" style={styles.heading}>
        Wine
      </Text>
      <Pressable
        style={styles.card}
        onPress={onPress ?? (() => router.push(`/vintages/${vintage.id}`))}
      >
        <View style={styles.row}>
          <View style={styles.details}>
            <Text variant="titleMedium">
              {wineName} {yearLabel}
            </Text>
            {winemaker && (
              <View style={styles.detailRow}>
                <Icon
                  source="account"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Pressable
                  onPress={() => router.push(`/winemakers/${winemaker.id}`)}
                >
                  <Text variant="bodyMedium" style={styles.linkText}>
                    {winemaker.name}
                  </Text>
                </Pressable>
              </View>
            )}
            {(region || country) && (
              <View style={styles.detailRow}>
                <Icon
                  source="earth"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text variant="bodyMedium" style={styles.detailText}>
                  {[region?.name, country?.name].filter(Boolean).join(", ")}
                </Text>
              </View>
            )}
            {drinkingWindow !== "-" && (
              <View style={styles.detailRow}>
                {drinkingIcon !== "" && (
                  <Icon
                    source={drinkingIcon}
                    size={16}
                    color={getDrinkingStatusColors(theme)[drinkingStatus]}
                  />
                )}
                <Text variant="bodyMedium" style={styles.detailText}>
                  {drinkingWindow}
                </Text>
              </View>
            )}
          </View>
          <WineThumbnail
            imageId={thumbnailImage?.id}
            wineType={wineType ?? "red"}
          />
        </View>
      </Pressable>
    </>
  );
}
