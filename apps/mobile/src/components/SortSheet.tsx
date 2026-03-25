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

type SortOption = {
  label: string;
  value: string;
};

type SortSheetProps = {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
};

export function SortSheet({ options, value, onChange }: SortSheetProps) {
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState(value);

  const currentLabel = options.find((o) => o.value === value)?.label;

  function handleOpen() {
    setDraft(value);
    setVisible(true);
  }

  function handleApply() {
    onChange(draft);
    setVisible(false);
  }

  return (
    <>
      <Button
        mode={currentLabel ? "contained-tonal" : "outlined"}
        icon="sort"
        onPress={handleOpen}
        compact
      >
        {currentLabel ?? "Sort"}
      </Button>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Sort By</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setVisible(false)}
            />
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.chips}>
              {options.map((option) => (
                <Chip
                  key={option.value}
                  selected={draft === option.value}
                  onPress={() => setDraft(option.value)}
                  style={styles.chip}
                >
                  {option.label}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Button mode="contained" onPress={handleApply}>
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
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
});
