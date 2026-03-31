import { useState, useEffect, useMemo } from "react";
import { View, FlatList, StyleSheet, Pressable } from "react-native";
import {
  Modal,
  Portal,
  Text,
  Searchbar,
  RadioButton,
  IconButton,
  Divider,
  HelperText,
} from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { theme } from "@/lib/theme";
import type { Wine, WineMaker, Vintage } from "@cellarboss/types";

type WineVintageSelectorProps = {
  label: string;
  value: string;
  onChange: (vintageId: string) => void;
  disabled?: boolean;
  error?: string;
};

export function WineVintageSelector({
  label,
  value,
  onChange,
  disabled = false,
  error,
}: WineVintageSelectorProps) {
  const [wineModalVisible, setWineModalVisible] = useState(false);
  const [vintageModalVisible, setVintageModalVisible] = useState(false);
  const [selectedWineId, setSelectedWineId] = useState<number | null>(null);
  const [wineSearch, setWineSearch] = useState("");

  const { data: wines } = useQuery({
    queryKey: ["wines"],
    queryFn: async () => {
      const r = await api.wines.getAll();
      if (!r.ok) throw new Error(r.error.message);
      return r.data;
    },
  });

  const { data: winemakers } = useQuery({
    queryKey: ["winemakers"],
    queryFn: async () => {
      const r = await api.winemakers.getAll();
      if (!r.ok) throw new Error(r.error.message);
      return r.data;
    },
  });

  const { data: vintages } = useQuery({
    queryKey: ["vintages"],
    queryFn: async () => {
      const r = await api.vintages.getAll();
      if (!r.ok) throw new Error(r.error.message);
      return r.data;
    },
  });

  // Pre-populate wine from existing vintageId (edit mode)
  useEffect(() => {
    if (selectedWineId !== null || !value || !vintages) return;
    const vintage = vintages.find((v) => String(v.id) === value);
    if (vintage) setSelectedWineId(vintage.wineId);
  }, [vintages, value, selectedWineId]);

  const winemakerMap = useMemo(
    () => new Map((winemakers ?? []).map((wm) => [wm.id, wm])),
    [winemakers],
  );

  const wineMap = useMemo(
    () => new Map((wines ?? []).map((w) => [w.id, w])),
    [wines],
  );

  // Group wines by winemaker for display
  const groupedWines = useMemo(() => {
    if (!wines || !winemakers) return [];
    const search = wineSearch.toLowerCase();
    const groups: Array<{ winemaker: WineMaker; wines: Wine[] }> = [];

    for (const wm of winemakers) {
      const wmWines = wines
        .filter((w) => w.wineMakerId === wm.id)
        .filter(
          (w) =>
            !search ||
            w.name.toLowerCase().includes(search) ||
            wm.name.toLowerCase().includes(search),
        );
      if (wmWines.length > 0) {
        groups.push({ winemaker: wm, wines: wmWines });
      }
    }
    return groups;
  }, [wines, winemakers, wineSearch]);

  // Vintages for the selected wine, sorted by year desc
  const filteredVintages = useMemo(() => {
    if (!vintages || selectedWineId === null) return [];
    return vintages
      .filter((v) => v.wineId === selectedWineId)
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  }, [vintages, selectedWineId]);

  // Resolve display names
  const selectedVintage = vintages?.find((v) => String(v.id) === value);
  const selectedWine = selectedVintage
    ? wineMap.get(selectedVintage.wineId)
    : selectedWineId !== null
      ? wineMap.get(selectedWineId)
      : undefined;
  const selectedWinemaker = selectedWine
    ? winemakerMap.get(selectedWine.wineMakerId)
    : undefined;

  const displayText =
    selectedVintage && selectedWine
      ? `${selectedWinemaker ? selectedWinemaker.name + " — " : ""}${selectedWine.name} ${selectedVintage.year ?? "NV"}`
      : selectedWine
        ? `${selectedWine.name} (select vintage...)`
        : undefined;

  function handleWineSelect(wineId: number) {
    setSelectedWineId(wineId);
    onChange(""); // clear vintage when wine changes
    setWineModalVisible(false);
    setWineSearch("");
    // Immediately open vintage picker
    setTimeout(() => setVintageModalVisible(true), 300);
  }

  function handleVintageSelect(vintageId: number) {
    onChange(String(vintageId));
    setVintageModalVisible(false);
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      {/* Wine selector button */}
      <Pressable
        onPress={() => !disabled && setWineModalVisible(true)}
        style={[styles.selector, disabled && styles.selectorDisabled]}
      >
        <Text
          style={[styles.selectorText, !displayText && styles.placeholderText]}
          numberOfLines={1}
        >
          {displayText || "Choose a wine..."}
        </Text>
        <IconButton icon="chevron-down" size={20} />
      </Pressable>

      {/* Vintage year button — shown inline below wine when a wine is selected */}
      {selectedWineId !== null && !disabled && (
        <Pressable
          onPress={() => setVintageModalVisible(true)}
          style={[styles.selector, { marginTop: 8 }]}
        >
          <Text
            style={[
              styles.selectorText,
              !selectedVintage && styles.placeholderText,
            ]}
            numberOfLines={1}
          >
            {selectedVintage
              ? `Vintage: ${selectedVintage.year ?? "NV"}`
              : "Choose a vintage year..."}
          </Text>
          <IconButton icon="chevron-down" size={20} />
        </Pressable>
      )}

      {error && <HelperText type="error">{error}</HelperText>}

      {/* Wine modal — grouped by winemaker */}
      <Portal>
        <Modal
          visible={wineModalVisible}
          onDismiss={() => {
            setWineModalVisible(false);
            setWineSearch("");
          }}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Wine</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => {
                setWineModalVisible(false);
                setWineSearch("");
              }}
            />
          </View>

          <Searchbar
            placeholder="Search wines..."
            value={wineSearch}
            onChangeText={setWineSearch}
            style={styles.searchbar}
          />

          <FlatList
            data={groupedWines}
            keyExtractor={(group) => String(group.winemaker.id)}
            style={styles.list}
            renderItem={({ item: group }) => (
              <View>
                <Text style={styles.groupHeader}>{group.winemaker.name}</Text>
                {group.wines.map((wine) => {
                  const selected = wine.id === selectedWineId;
                  return (
                    <Pressable
                      key={wine.id}
                      onPress={() => handleWineSelect(wine.id)}
                      style={[styles.item, selected && styles.itemSelected]}
                    >
                      <RadioButton
                        value={String(wine.id)}
                        status={selected ? "checked" : "unchecked"}
                        onPress={() => handleWineSelect(wine.id)}
                      />
                      <Text style={styles.itemText}>{wine.name}</Text>
                    </Pressable>
                  );
                })}
                <Divider />
              </View>
            )}
          />
        </Modal>
      </Portal>

      {/* Vintage modal — list of years for selected wine */}
      <Portal>
        <Modal
          visible={vintageModalVisible}
          onDismiss={() => setVintageModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedWine
                ? `${selectedWine.name} — Vintage`
                : "Select Vintage"}
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setVintageModalVisible(false)}
            />
          </View>

          {filteredVintages.length === 0 ? (
            <Text style={styles.emptyText}>
              No vintages found for this wine.
            </Text>
          ) : (
            <FlatList
              data={filteredVintages}
              keyExtractor={(v) => String(v.id)}
              style={styles.list}
              renderItem={({ item: vintage }) => {
                const selected = String(vintage.id) === value;
                return (
                  <Pressable
                    onPress={() => handleVintageSelect(vintage.id)}
                    style={[styles.item, selected && styles.itemSelected]}
                  >
                    <RadioButton
                      value={String(vintage.id)}
                      status={selected ? "checked" : "unchecked"}
                      onPress={() => handleVintageSelect(vintage.id)}
                    />
                    <Text style={styles.itemText}>{vintage.year ?? "NV"}</Text>
                  </Pressable>
                );
              }}
            />
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 4,
    paddingLeft: 12,
    minHeight: 48,
  },
  selectorDisabled: {
    opacity: 0.5,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  placeholderText: {
    color: theme.colors.onSurfaceVariant,
  },
  modal: {
    backgroundColor: theme.colors.surface,
    margin: 24,
    borderRadius: 12,
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.onSurface,
    flex: 1,
  },
  searchbar: {
    margin: 12,
    height: 40,
  },
  list: {
    maxHeight: 350,
  },
  groupHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  itemSelected: {
    backgroundColor: theme.colors.primaryContainer,
  },
  itemText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    flex: 1,
  },
  emptyText: {
    padding: 24,
    textAlign: "center",
    color: theme.colors.onSurfaceVariant,
  },
});
