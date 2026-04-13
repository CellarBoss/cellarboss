import { useState, useEffect } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import {
  Text,
  Icon,
  IconButton,
  Modal,
  Portal,
  RadioButton,
} from "react-native-paper";
import {
  BOTTLE_STATUS_ICONS,
  BOTTLE_STATUS_COLORS,
} from "@/lib/constants/bottles";
import { BOTTLE_STATUSES } from "@cellarboss/validators/constants";
import type { BottleStatus } from "@cellarboss/validators/constants";
import { formatStatus } from "@/lib/functions/format";
import { useAppTheme } from "@/hooks/use-app-theme";

type StatusPickerModalProps = {
  visible: boolean;
  currentStatus: BottleStatus;
  onConfirm: (status: BottleStatus) => void;
  onDismiss: () => void;
};

export function StatusPickerModal({
  visible,
  currentStatus,
  onConfirm,
  onDismiss,
}: StatusPickerModalProps) {
  const theme = useAppTheme();
  const [draft, setDraft] = useState<BottleStatus>(currentStatus);

  useEffect(() => {
    if (visible) setDraft(currentStatus);
  }, [visible, currentStatus]);

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
    option: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
      paddingHorizontal: 16,
      gap: 12,
    },
    optionText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.onSurface,
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
          <Text style={styles.title}>Change Status</Text>
          <IconButton icon="close" size={24} onPress={onDismiss} />
        </View>
        {BOTTLE_STATUSES.map((status) => (
          <Pressable
            key={status}
            style={styles.option}
            onPress={() => setDraft(status)}
          >
            <Icon
              source={BOTTLE_STATUS_ICONS[status]}
              size={20}
              color={BOTTLE_STATUS_COLORS[status]}
            />
            <Text style={styles.optionText}>{formatStatus(status)}</Text>
            <RadioButton
              value={status}
              status={draft === status ? "checked" : "unchecked"}
              onPress={() => setDraft(status)}
            />
          </Pressable>
        ))}
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
