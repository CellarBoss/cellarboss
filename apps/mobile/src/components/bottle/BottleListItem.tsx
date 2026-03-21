import { useState, useRef } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { Text, Icon, IconButton } from "react-native-paper";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { getStatusColor, BOTTLE_STATUS_ICONS } from "@/lib/constants/bottles";
import { BOTTLE_SIZE_SHORT_LABELS } from "@cellarboss/common/constants";
import { WINE_TYPE_COLORS } from "@/lib/constants/wines";
import {
  DRINKING_STATUS_COLORS,
  DRINKING_STATUS_ICONS,
} from "@/lib/constants/drinking-status";
import type { BottleStatus } from "@cellarboss/validators/constants";
import { api } from "@/lib/api/client";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusPickerModal } from "./StatusPickerModal";
import { StoragePickerModal } from "./StoragePickerModal";

import { theme } from "@/lib/theme";
import type { Bottle } from "@cellarboss/types";
import type { WineType, BottleSize } from "@cellarboss/validators/constants";
import type { DrinkingStatus } from "@/lib/functions/format";

type BottleListItemProps = {
  bottle: Bottle;
  wineName: string;
  wineYear: string;
  winemakerName: string;
  storageHierarchy?: string[];
  wineType: WineType | undefined;
  drinkingStatus: DrinkingStatus;
  onPress: () => void;
  swipeable?: boolean;
};

export function BottleListItem({
  bottle,
  wineName,
  wineYear,
  winemakerName,
  storageHierarchy,
  wineType,
  drinkingStatus,
  onPress,
  swipeable = false,
}: BottleListItemProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const swipeableRef = useRef<Swipeable>(null);
  const [statusPickerVisible, setStatusPickerVisible] = useState(false);
  const [storagePickerVisible, setStoragePickerVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const bottleColor = wineType
    ? WINE_TYPE_COLORS[wineType]
    : theme.colors.onSurfaceVariant;
  const sizeLabel =
    BOTTLE_SIZE_SHORT_LABELS[bottle.size as BottleSize] ?? bottle.size;
  const drinkingIcon = DRINKING_STATUS_ICONS[drinkingStatus];
  const statusIcon =
    BOTTLE_STATUS_ICONS[bottle.status as BottleStatus] ?? "help-circle";

  const updateMutation = useMutation({
    mutationFn: (updated: Bottle) => api.bottles.update(updated),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bottles"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.bottles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bottles"] });
      setDeleteConfirmVisible(false);
    },
  });

  const content = (
    <Pressable style={styles.item} onPress={onPress}>
      <View style={styles.bottleIcon}>
        <Icon source="bottle-wine" size={28} color={bottleColor} />
        <Text style={styles.sizeLabel}>{sizeLabel}</Text>
      </View>

      <View style={styles.center}>
        <View style={styles.titleRow}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {wineName} {wineYear}
          </Text>
          {drinkingIcon !== "" && (
            <Icon
              source={drinkingIcon}
              size={16}
              color={DRINKING_STATUS_COLORS[drinkingStatus]}
            />
          )}
        </View>
        <Text style={styles.itemSub} numberOfLines={1}>
          {winemakerName}
        </Text>
        {storageHierarchy && storageHierarchy.length > 0 && (
          <View style={styles.storageRow}>
            <Icon
              source="map-marker-outline"
              size={13}
              color={theme.colors.onSurfaceVariant}
            />
            {storageHierarchy.map((name, i) => (
              <View key={i} style={styles.storageSegment}>
                {i > 0 && (
                  <Icon
                    source="chevron-right"
                    size={12}
                    color={theme.colors.outline}
                  />
                )}
                <Text style={styles.storageText} numberOfLines={1}>
                  {name}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <Icon
        source={statusIcon}
        size={20}
        color={getStatusColor(bottle.status)}
      />
    </Pressable>
  );

  const modals = (
    <>
      <StatusPickerModal
        visible={statusPickerVisible}
        currentStatus={bottle.status as BottleStatus}
        onConfirm={(status) => {
          updateMutation.mutate({ ...bottle, status });
          setStatusPickerVisible(false);
        }}
        onDismiss={() => setStatusPickerVisible(false)}
      />
      <StoragePickerModal
        visible={storagePickerVisible}
        currentStorageId={bottle.storageId}
        onConfirm={(storageId) => {
          updateMutation.mutate({ ...bottle, storageId });
          setStoragePickerVisible(false);
        }}
        onDismiss={() => setStoragePickerVisible(false)}
      />
      <ConfirmDialog
        visible={deleteConfirmVisible}
        title="Delete Bottle"
        message={`Delete this bottle of ${wineName}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => deleteMutation.mutate(bottle.id)}
        onCancel={() => setDeleteConfirmVisible(false)}
      />
    </>
  );

  if (!swipeable) {
    return (
      <>
        {content}
        {modals}
      </>
    );
  }

  return (
    <>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={() => (
          <View style={styles.swipeActions}>
            <IconButton
              icon="pencil"
              iconColor="#fff"
              containerColor={theme.colors.primary}
              size={20}
              onPress={() => {
                swipeableRef.current?.close();
                router.push(`/bottles/${bottle.id}/edit`);
              }}
            />
            <IconButton
              icon="swap-horizontal"
              iconColor="#fff"
              containerColor="#8B5CF6"
              size={20}
              onPress={() => {
                swipeableRef.current?.close();
                setStatusPickerVisible(true);
              }}
            />
            <IconButton
              icon="archive-arrow-down"
              iconColor="#fff"
              containerColor="#0891B2"
              size={20}
              onPress={() => {
                swipeableRef.current?.close();
                setStoragePickerVisible(true);
              }}
            />
            <IconButton
              icon="delete"
              iconColor="#fff"
              containerColor="#dc2626"
              size={20}
              onPress={() => {
                swipeableRef.current?.close();
                setDeleteConfirmVisible(true);
              }}
            />
          </View>
        )}
      >
        {content}
      </Swipeable>
      {modals}
    </>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    gap: 12,
  },
  bottleIcon: {
    alignItems: "center",
    width: 36,
  },
  sizeLabel: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  center: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemTitle: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  itemSub: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  storageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  storageSegment: {
    flexDirection: "row",
    alignItems: "center",
  },
  storageText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 4,
  },
});
