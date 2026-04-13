import { View, Pressable, StyleSheet, Alert } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Camera, Images } from "lucide-react-native";
import { uploadRequest } from "@/lib/api/upload";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { Image as ImageType } from "@cellarboss/types";

type Props = { vintageId: number };

export function ImageUpload({ vintageId }: Props) {
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  async function uploadAssets(assets: ImagePicker.ImagePickerAsset[]) {
    setUploading(true);
    try {
      for (const asset of assets) {
        const formData = new FormData();
        // React Native FormData supports { uri, type, name } for file uploads
        formData.append("file", {
          uri: asset.uri,
          type: asset.mimeType ?? "image/jpeg",
          name: asset.fileName ?? "photo.jpg",
        } as unknown as Blob);
        formData.append("vintageId", String(vintageId));

        const result = await uploadRequest<ImageType>("image/upload", formData);
        if (!result.ok) {
          Alert.alert("Upload failed", result.error.message);
          return;
        }
      }
      queryClient.invalidateQueries({ queryKey: ["images", vintageId] });
    } finally {
      setUploading(false);
    }
  }

  async function handleCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Camera access is needed to take photos.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      await uploadAssets(result.assets);
    }
  }

  async function handleLibrary() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Photo library access is needed.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      await uploadAssets(result.assets);
    }
  }

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
    },
    btn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    btnText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: "500",
    },
    uploading: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 12,
      paddingVertical: 10,
    },
    uploadingText: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
  });

  if (uploading) {
    return (
      <View style={styles.uploading}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.uploadingText}>Uploading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.btn} onPress={handleCamera}>
        <Camera size={18} color={theme.colors.primary} />
        <Text style={styles.btnText}>Take Photo</Text>
      </Pressable>
      <Pressable style={styles.btn} onPress={handleLibrary}>
        <Images size={18} color={theme.colors.primary} />
        <Text style={styles.btnText}>Choose from Library</Text>
      </Pressable>
    </View>
  );
}
