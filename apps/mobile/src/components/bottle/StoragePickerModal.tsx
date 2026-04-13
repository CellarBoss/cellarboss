import { useState, useMemo, useEffect } from "react";
import { View, Pressable, FlatList, StyleSheet } from "react-native";
import {
  Text,
  IconButton,
  Modal,
  Portal,
  RadioButton,
  Searchbar,
} from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { Storage } from "@cellarboss/types";

type StoragePickerModalProps = {
  visible: boolean;
  currentStorageId: number | null;
  onConfirm: (storageId: number | null) => void;
  onDismiss: () => void;
};

function buildFlatTree(
  storages: Storage[],
  parentId: number | null = null,
  depth = 0,
): Array<{ storage: Storage; depth: number }> {
  const result: Array<{ storage: Storage; depth: number }> = [];
  for (const s of storages) {
    if ((s.parent ?? null) === parentId) {
      result.push({ storage: s, depth });
      result.push(...buildFlatTree(storages, s.id, depth + 1));
    }
  }
  return result;
}

export function StoragePickerModal({
  visible,
  currentStorageId,
  onConfirm,
  onDismiss,
}: StoragePickerModalProps) {
  const theme = useAppTheme();
  const [draft, setDraft] = useState<number | null>(currentStorageId);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (visible) {
      setDraft(currentStorageId);
      setSearch("");
    }
  }, [visible, currentStorageId]);

  const { data: storages } = useQuery({
    queryKey: ["storages"],
    queryFn: async () => {
      const result = await api.storages.getAll();
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
    enabled: visible,
  });

  const storageTree = useMemo(() => {
    if (!storages) return [];
    const tree = buildFlatTree(storages);
    if (!search) return tree;
    const lower = search.toLowerCase();
    const matchIds = new Set(
      tree
        .filter(({ storage }) => storage.name.toLowerCase().includes(lower))
        .map(({ storage }) => storage.id),
    );
    const parentMap = new Map(storages.map((s) => [s.id, s.parent ?? null]));
    const visibleIds = new Set<number>();
    for (const id of matchIds) {
      visibleIds.add(id);
      let pid = parentMap.get(id) ?? null;
      while (pid !== null) {
        visibleIds.add(pid);
        pid = parentMap.get(pid) ?? null;
      }
    }
    return tree.filter(({ storage }) => visibleIds.has(storage.id));
  }, [storages, search]);

  const styles = StyleSheet.create({
    modal: {
      backgroundColor: theme.colors.surface,
      margin: 24,
      borderRadius: 12,
      maxHeight: "80%",
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    searchbar: {
      margin: 12,
      height: 40,
    },
    list: {
      maxHeight: 300,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    optionSelected: {
      backgroundColor: theme.colors.primaryContainer,
    },
    optionText: {
      fontSize: 16,
      color: theme.colors.onSurface,
      flex: 1,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      padding: 12,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
    },
    cancelButton: {
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 8,
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.onSurfaceVariant,
    },
    okButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 8,
    },
    okButtonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 14,
    },
  });

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Move to Storage</Text>
          <IconButton icon="close" size={24} onPress={onDismiss} />
        </View>
        <Searchbar
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchbar}
        />
        <FlatList
          data={storageTree}
          keyExtractor={({ storage }) => String(storage.id)}
          style={styles.list}
          ListHeaderComponent={
            <Pressable
              style={[styles.option, draft === null && styles.optionSelected]}
              onPress={() => setDraft(null)}
            >
              <RadioButton
                value="none"
                status={draft === null ? "checked" : "unchecked"}
                onPress={() => setDraft(null)}
              />
              <Text style={styles.optionText}>None</Text>
            </Pressable>
          }
          renderItem={({ item: { storage, depth } }) => (
            <Pressable
              style={[
                styles.option,
                draft === storage.id && styles.optionSelected,
                depth > 0 && { paddingLeft: 8 + depth * 20 },
              ]}
              onPress={() => setDraft(storage.id)}
            >
              <RadioButton
                value={String(storage.id)}
                status={draft === storage.id ? "checked" : "unchecked"}
                onPress={() => setDraft(storage.id)}
              />
              <Text style={styles.optionText}>{storage.name}</Text>
            </Pressable>
          )}
        />
        <View style={styles.actions}>
          <Pressable style={styles.cancelButton} onPress={onDismiss}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.okButton} onPress={() => onConfirm(draft)}>
            <Text style={styles.okButtonText}>OK</Text>
          </Pressable>
        </View>
      </Modal>
    </Portal>
  );
}
