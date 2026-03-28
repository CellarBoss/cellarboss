import { commonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { tastingNoteEditFields } from "@/lib/fields/tasting-notes";
import type { TastingNote } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";

export default function EditTastingNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const noteQuery = useApiQuery({
    queryKey: ["tastingNotes", Number(id)],
    queryFn: () => api.tastingNotes.getById(Number(id)),
  });

  const result = queryGate([noteQuery]);
  if (!result.ready) return result.gate;

  const [note] = result.data;

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<TastingNote>> => {
    const updateResult = await api.tastingNotes.update(Number(id), {
      score: Number(data.score),
      notes: data.notes,
    });

    if (updateResult.ok) {
      queryClient.invalidateQueries({ queryKey: ["tastingNotes"] });
    }

    return updateResult;
  };

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader title="Edit Tasting Note" showBack />
      <FormCard
        mode="edit"
        data={note}
        fields={tastingNoteEditFields}
        processSave={processSave}
      />
    </SafeAreaView>
  );
}
