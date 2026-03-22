import { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Modal,
  Portal,
  Text,
  Button,
  IconButton,
  Chip,
} from "react-native-paper";
import { theme } from "@/lib/theme";
import type { SelectOption } from "@/lib/types/field";

export type FilterConfig = {
  key: string;
  label: string;
  options: SelectOption[];
  multiple?: boolean;
};

type FilterValues = Record<string, string[]>;

type FilterSheetProps = {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
};

export function FilterSheet({ filters, values, onChange }: FilterSheetProps) {
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState<FilterValues>(values);

  const activeCount = Object.values(values).filter((v) => v.length > 0).length;

  function handleOpen() {
    setDraft({ ...values });
    setVisible(true);
  }

  function handleApply() {
    onChange(draft);
    setVisible(false);
  }

  function handleClear() {
    const cleared: FilterValues = {};
    filters.forEach((f) => (cleared[f.key] = []));
    setDraft(cleared);
  }

  function toggleValue(filterKey: string, value: string, multiple: boolean) {
    setDraft((prev) => {
      const current = prev[filterKey] ?? [];
      if (multiple) {
        if (current.includes(value)) {
          return { ...prev, [filterKey]: current.filter((v) => v !== value) };
        }
        return { ...prev, [filterKey]: [...current, value] };
      }
      // Single select: toggle off if already selected
      if (current.includes(value)) {
        return { ...prev, [filterKey]: [] };
      }
      return { ...prev, [filterKey]: [value] };
    });
  }

  return (
    <>
      <Button
        testID="filter-button"
        mode={activeCount > 0 ? "contained-tonal" : "outlined"}
        icon="filter-variant"
        onPress={handleOpen}
        compact
      >
        Filters{activeCount > 0 ? ` (${activeCount})` : ""}
      </Button>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setVisible(false)}
            />
          </View>

          <ScrollView style={styles.content}>
            {filters.map((filter) => (
              <View key={filter.key} style={styles.filterGroup}>
                <Text style={styles.filterLabel}>{filter.label}</Text>
                <View style={styles.chips}>
                  {filter.options.map((option) => {
                    const selected = (draft[filter.key] ?? []).includes(
                      option.value,
                    );
                    return (
                      <Chip
                        key={option.value}
                        selected={selected}
                        onPress={() =>
                          toggleValue(
                            filter.key,
                            option.value,
                            filter.multiple ?? false,
                          )
                        }
                        style={styles.chip}
                      >
                        {option.label}
                      </Chip>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <Button
              testID="filter-clear-button"
              mode="outlined"
              onPress={handleClear}
            >
              Clear All
            </Button>
            <Button
              testID="filter-apply-button"
              mode="contained"
              onPress={handleApply}
            >
              Apply
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
}

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
  content: {
    padding: 16,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    gap: 12,
  },
});
