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
} from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { theme } from "@/lib/theme";
import type { GenericType } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/api-client";

type DataSelectorProps = {
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  queryKey: string;
  queryFn: () => Promise<ApiResult<GenericType[]>>;
  allowMultiple?: boolean;
  disabled?: boolean;
};

export function DataSelector({
  label,
  value,
  onChange,
  queryKey,
  queryFn,
  allowMultiple = false,
  disabled = false,
}: DataSelectorProps) {
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

  const filtered = useMemo(() => {
    if (!items) return [];
    if (!search) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [items, search]);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const selectedNames = items
    ?.filter((item) => selectedValues.includes(String(item.id)))
    .map((item) => item.name)
    .join(", ");

  function handleSelect(itemId: string) {
    if (allowMultiple) {
      const current = Array.isArray(value) ? value : value ? [value] : [];
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

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => !disabled && setVisible(true)}
        style={[styles.selector, disabled && styles.selectorDisabled]}
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
            placeholder="Search..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchbar}
          />

          {isLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              style={styles.list}
              renderItem={({ item }) => {
                const itemId = String(item.id);
                const selected = selectedValues.includes(itemId);

                return (
                  <Pressable
                    onPress={() => handleSelect(itemId)}
                    style={[styles.item, selected && styles.itemSelected]}
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
                    <Text style={styles.itemText}>{item.name}</Text>
                  </Pressable>
                );
              }}
            />
          )}

          {allowMultiple && (
            <View style={styles.modalActions}>
              <Pressable
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
