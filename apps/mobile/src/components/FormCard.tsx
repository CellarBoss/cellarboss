import { useState } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useForm } from "@tanstack/react-form";
import * as Haptics from "expo-haptics";
import { FormField } from "./FormField";
import { DataSelector } from "./DataSelector";
import { WineVintageSelector } from "./WineVintageSelector";
import { theme, shadows } from "@/lib/theme";
import type { ApiResult } from "@cellarboss/common";
import type { FieldConfig } from "@/lib/types/field";

type FormCardProps<T extends { id: number | string }> = {
  mode: "view" | "edit" | "create";
  data?: T;
  fields: FieldConfig<T>[];
  processSave?: (data: Record<string, string>) => Promise<ApiResult<T>>;
  onSuccess?: () => void;
};

function stringifyValues(
  obj?: Record<string, unknown>,
): Record<string, string> {
  if (!obj) return {};
  const result: Record<string, string> = {};
  for (const key in obj) {
    const val = obj[key];
    result[key] = val === null || val === undefined ? "" : String(val);
  }
  return result;
}

export function FormCard<T extends { id: number | string }>({
  mode,
  data,
  fields,
  processSave,
  onSuccess,
}: FormCardProps<T>) {
  const router = useRouter();
  const editable = mode !== "view";

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: stringifyValues(data as Record<string, unknown>),
    onSubmit: async ({ value }) => {
      if (!processSave) return;

      setIsProcessing(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const result = await processSave(value);

        if (!result.ok) {
          const errors = [];
          for (const err in result.error.errors) {
            errors.push(result.error.errors[err]);
          }
          setErrorMessage(result.error.message + ": " + errors.join(", "));
          return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSuccessMessage("Saved successfully!");

        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.back();
          }
        }, 1000);
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : "Something went wrong.",
        );
      } finally {
        setIsProcessing(false);
      }
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {fields.map((field) => (
            <form.Field
              key={String(field.key)}
              name={String(field.key)}
              children={(fieldApi) =>
                field.type === "wine-vintage" ? (
                  <WineVintageSelector
                    label={field.label}
                    value={fieldApi.state.value ?? ""}
                    onChange={(v) => fieldApi.handleChange(v)}
                    disabled={!editable || field.editable === false}
                  />
                ) : field.type === "selector" && field.selectorConfig ? (
                  <DataSelector
                    label={field.label}
                    value={fieldApi.state.value ?? ""}
                    onChange={(v) =>
                      fieldApi.handleChange(Array.isArray(v) ? v.join(",") : v)
                    }
                    queryKey={field.selectorConfig.queryKey}
                    queryFn={field.selectorConfig.queryFn}
                    allowMultiple={field.selectorConfig.allowMultiple}
                    allowNone={field.selectorConfig.allowNone}
                    hierarchical={field.selectorConfig.hierarchical}
                    groupBy={field.selectorConfig.groupBy}
                    disabled={!editable || field.editable === false}
                  />
                ) : (
                  <FormField
                    label={field.label}
                    value={fieldApi.state.value ?? ""}
                    onChangeValue={(v) => fieldApi.handleChange(v)}
                    type={field.type}
                    editable={editable && field.editable !== false}
                    error={
                      fieldApi.state.meta.errors?.[0] as string | undefined
                    }
                    options={"options" in field ? field.options : undefined}
                    numberProps={
                      "numberProps" in field ? field.numberProps : undefined
                    }
                  />
                )
              }
            />
          ))}
        </View>

        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
        {successMessage && <Text style={styles.success}>{successMessage}</Text>}

        <View style={styles.actions}>
          <Button
            testID="back-button"
            mode="outlined"
            onPress={() => router.back()}
            style={styles.actionButton}
          >
            Back
          </Button>
          {editable && (
            <Button
              testID="save-button"
              mode="contained"
              onPress={() => form.handleSubmit()}
              loading={isProcessing}
              disabled={isProcessing}
              style={styles.actionButton}
            >
              Save
            </Button>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    ...shadows.card,
  },
  error: {
    color: theme.colors.error,
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  success: {
    color: "#16a34a",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    minWidth: 100,
  },
});
