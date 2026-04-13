import { useState, useMemo } from "react";
import { View, FlatList, StyleSheet, Pressable } from "react-native";
import {
  Modal,
  Portal,
  Text,
  Searchbar,
  RadioButton,
  Checkbox,
  IconButton,
  HelperText,
} from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { GenericType } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";

type HierarchicalItem = GenericType & { parent?: number | null };

type TreeNode = {
  item: GenericType;
  depth: number;
  isGroupHeader?: boolean;
};

function buildFlatTree(
  items: HierarchicalItem[],
  parentId: number | null = null,
  depth = 0,
): TreeNode[] {
  const result: TreeNode[] = [];
  for (const item of items) {
    if ((item.parent ?? null) === parentId) {
      result.push({ item, depth });
      result.push(...buildFlatTree(items, item.id, depth + 1));
    }
  }
  return result;
}

type GroupByConfig = {
  key: string;
  queryKey: string;
  queryFn: () => Promise<ApiResult<GenericType[]>>;
};

type DataSelectorProps = {
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  queryKey: string;
  queryFn: () => Promise<ApiResult<GenericType[]>>;
  allowMultiple?: boolean;
  allowNone?: boolean;
  hierarchical?: boolean;
  groupBy?: GroupByConfig;
  disabled?: boolean;
  error?: string;
};

const NONE_ITEM: GenericType = { id: -1, name: "None" };

export function DataSelector({
  label,
  value,
  onChange,
  queryKey,
  queryFn,
  allowMultiple = false,
  allowNone = false,
  hierarchical = false,
  groupBy,
  disabled = false,
  error,
}: DataSelectorProps) {
  const theme = useAppTheme();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const { data: items, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const result = await queryFn();
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
  });

  const { data: groupItems, isLoading: groupLoading } = useQuery({
    queryKey: [groupBy?.queryKey ?? "__unused__"],
    queryFn: async () => {
      if (!groupBy) return [];
      const result = await groupBy.queryFn();
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!groupBy,
  });

  const displayItems = useMemo((): TreeNode[] => {
    if (!items) return [];

    if (hierarchical) {
      const tree = buildFlatTree(items as HierarchicalItem[]);
      if (search) {
        const lower = search.toLowerCase();
        const matchIds = new Set(
          tree
            .filter(({ item }) => item.name.toLowerCase().includes(lower))
            .map(({ item }) => item.id),
        );
        const parentMap = new Map(
          (items as HierarchicalItem[]).map((i) => [i.id, i.parent ?? null]),
        );
        const visibleIds = new Set<number>();
        for (const id of matchIds) {
          visibleIds.add(id);
          let pid = parentMap.get(id) ?? null;
          while (pid !== null) {
            visibleIds.add(pid);
            pid = parentMap.get(pid) ?? null;
          }
        }
        const filtered = tree.filter(({ item }) => visibleIds.has(item.id));
        return allowNone
          ? [{ item: NONE_ITEM, depth: 0 }, ...filtered]
          : filtered;
      }
      return allowNone ? [{ item: NONE_ITEM, depth: 0 }, ...tree] : tree;
    }

    if (groupBy && groupItems) {
      const groupMap = new Map(groupItems.map((g) => [g.id, g]));
      const lower = search.toLowerCase();
      const buckets = new Map<number, GenericType[]>();
      for (const item of items) {
        const groupId = (item as unknown as Record<string, unknown>)[
          groupBy.key
        ] as number;
        if (!buckets.has(groupId)) buckets.set(groupId, []);
        buckets.get(groupId)!.push(item);
      }
      const result: TreeNode[] = [];
      if (allowNone && !search) {
        result.push({ item: NONE_ITEM, depth: 0 });
      }
      for (const group of groupItems) {
        const children = buckets.get(group.id) ?? [];
        const filtered = search
          ? children.filter((c) => c.name.toLowerCase().includes(lower))
          : children;
        if (filtered.length === 0) continue;
        result.push({ item: group, depth: 0, isGroupHeader: true });
        for (const child of filtered) {
          result.push({ item: child, depth: 1 });
        }
      }
      // Items with no matching group
      const ungrouped = items.filter(
        (item) =>
          !groupMap.has(
            (item as unknown as Record<string, unknown>)[groupBy.key] as number,
          ),
      );
      const filteredUngrouped = search
        ? ungrouped.filter((c) => c.name.toLowerCase().includes(lower))
        : ungrouped;
      for (const child of filteredUngrouped) {
        result.push({ item: child, depth: 0 });
      }
      return result;
    }

    const base = search
      ? items.filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase()),
        )
      : items;
    const flat = base.map((item) => ({ item, depth: 0 }));
    return allowNone && !search
      ? [{ item: NONE_ITEM, depth: 0 }, ...flat]
      : flat;
  }, [items, search, allowNone, hierarchical, groupBy, groupItems]);

  const selectedValues = Array.isArray(value)
    ? value
    : allowMultiple && typeof value === "string" && value.includes(",")
      ? value.split(",").filter(Boolean)
      : value
        ? [value]
        : [];
  const selectedNames =
    !value || value === ""
      ? allowNone
        ? "None"
        : undefined
      : items
          ?.filter((item) => selectedValues.includes(String(item.id)))
          .map((item) => item.name)
          .join(", ");

  function handleSelect(itemId: string) {
    if (itemId === String(NONE_ITEM.id)) {
      onChange("");
      setVisible(false);
      return;
    }
    if (allowMultiple) {
      const current = selectedValues;
      if (current.includes(itemId)) {
        onChange(current.filter((v) => v !== itemId));
      } else {
        onChange([...current, itemId]);
      }
    } else {
      onChange(itemId);
      setVisible(false);
    }
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
    selectorError: {
      borderColor: theme.colors.error,
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
    },
    searchbar: {
      margin: 12,
      height: 40,
    },
    loadingText: {
      padding: 24,
      textAlign: "center",
      color: theme.colors.onSurfaceVariant,
    },
    list: {
      maxHeight: 300,
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
    groupHeader: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.surfaceVariant,
    },
    groupHeaderText: {
      fontSize: 13,
      fontWeight: "bold",
      color: theme.colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    depthIndicator: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginRight: 2,
    },
    itemText: {
      fontSize: 16,
      color: theme.colors.onSurface,
      flex: 1,
    },
    modalActions: {
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
      alignItems: "flex-end",
    },
    doneButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 8,
    },
    doneButtonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 14,
    },
  });

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        testID={`selector-${label.toLowerCase().replace(/\s+/g, "-")}`}
        onPress={() => !disabled && setVisible(true)}
        style={[
          styles.selector,
          disabled && styles.selectorDisabled,
          !!error && styles.selectorError,
        ]}
      >
        <Text
          style={[
            styles.selectorText,
            !selectedNames && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedNames || "Select..."}
        </Text>
        <IconButton icon="chevron-down" size={20} />
      </Pressable>
      {error && <HelperText type="error">{error}</HelperText>}

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label}</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setVisible(false)}
            />
          </View>

          <Searchbar
            testID="selector-search-input"
            placeholder="Search..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchbar}
          />

          {isLoading || groupLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            <FlatList
              data={displayItems}
              keyExtractor={(node) =>
                node.isGroupHeader
                  ? `group-${node.item.id}`
                  : String(node.item.id)
              }
              style={styles.list}
              renderItem={({ item: node }) => {
                if (node.isGroupHeader) {
                  return (
                    <View style={styles.groupHeader}>
                      <Text style={styles.groupHeaderText}>
                        {node.item.name}
                      </Text>
                    </View>
                  );
                }

                const itemId = String(node.item.id);
                const selected = selectedValues.includes(itemId);

                return (
                  <Pressable
                    onPress={() => handleSelect(itemId)}
                    style={[
                      styles.item,
                      selected && styles.itemSelected,
                      node.depth > 0 && { paddingLeft: 8 + node.depth * 20 },
                    ]}
                  >
                    {allowMultiple ? (
                      <Checkbox
                        status={selected ? "checked" : "unchecked"}
                        onPress={() => handleSelect(itemId)}
                      />
                    ) : (
                      <RadioButton
                        value={itemId}
                        status={selected ? "checked" : "unchecked"}
                        onPress={() => handleSelect(itemId)}
                      />
                    )}
                    {node.depth > 0 && (
                      <Text style={styles.depthIndicator}>&nbsp;</Text>
                    )}
                    <Text style={styles.itemText}>{node.item.name}</Text>
                  </Pressable>
                );
              }}
            />
          )}

          {allowMultiple && (
            <View style={styles.modalActions}>
              <Pressable
                testID="selector-done-button"
                onPress={() => setVisible(false)}
                style={styles.doneButton}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </Pressable>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
}
