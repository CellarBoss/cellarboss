import { commonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/form/FormCard";
import { api } from "@/lib/api/client";
import { tastingNoteCreateFields } from "@/lib/fields/tasting-notes";
import type { TastingNote } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";

export default function NewTastingNoteScreen() {
  const queryClient = useQueryClient();
  const { vintageId } = useLocalSearchParams<{ vintageId?: string }>();

  const defaultData: TastingNote = {
    id: 0,
    vintageId: vintageId ? Number(vintageId) : 0,
    date: "",
    authorId: "",
    author: "",
    score: 0,
    notes: "",
  };

  const processSave = async (
    data: Record<string, string>,
  ): Promise<ApiResult<TastingNote>> => {
    const result = await api.tastingNotes.create({
      vintageId: Number(data.vintageId),
      score: Number(data.score),
      notes: data.notes,
    });

    if (result.ok) {
      queryClient.invalidateQueries({ queryKey: ["tastingNotes"] });
    }

    return result;
  };

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader title="New Tasting Note" showBack />
      <FormCard
        mode="create"
        data={defaultData}
        fields={tastingNoteCreateFields}
        processSave={processSave}
      />
    </SafeAreaView>
  );
}
