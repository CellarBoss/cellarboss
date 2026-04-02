import {
  View,
  Image,
  FlatList,
  Pressable,
  Modal,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/base-url";
import { getToken } from "@/lib/auth/secure-store";
import { theme } from "@/lib/theme";
import type { Image as ImageType } from "@cellarboss/types";
import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const THUMB_SIZE = (SCREEN_WIDTH - 48) / 3; // 3 columns with padding

type Props = { vintageId: number };

export function ImageGallery({ vintageId }: Props) {
  const queryClient = useQueryClient();
  const [lightboxImage, setLightboxImage] = useState<ImageType | null>(null);
  const [authHeaders, setAuthHeaders] = useState<Record<string, string>>({});
  const [baseUrl, setBaseUrl] = useState<string>("");

  useEffect(() => {
    async function loadAuth() {
      const [url, token] = await Promise.all([getApiBaseUrl(), getToken()]);
      if (url) setBaseUrl(url);
      if (token) setAuthHeaders({ Authorization: `Bearer ${token}` });
    }
    loadAuth();
  }, []);

  const imagesQuery = useApiQuery({
    queryKey: ["images", vintageId],
    queryFn: () => api.images.getByVintageId(vintageId),
  });

  const images = imagesQuery.data ?? [];

  function imageUrl(id: number) {
    return {
      uri: `${baseUrl}/api/${api.images.getImageUrl(id)}`,
      headers: authHeaders,
    };
  }

  function thumbUrl(id: number) {
    return {
      uri: `${baseUrl}/api/${api.images.getThumbUrl(id)}`,
      headers: authHeaders,
    };
  }

  async function handleDelete(image: ImageType) {
    Alert.alert("Delete Image", "Are you sure you want to delete this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const result = await api.images.delete(image.id);
          if (result.ok) {
            queryClient.invalidateQueries({ queryKey: ["images", vintageId] });
            if (lightboxImage?.id === image.id) setLightboxImage(null);
          }
        },
      },
    ]);
  }

  if (imagesQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  if (images.length === 0) {
    return <Text style={styles.empty}>No images yet</Text>;
  }

  return (
    <View>
      <FlatList
        data={images}
        numColumns={3}
        scrollEnabled={false}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <Pressable
            style={styles.thumb}
            onPress={() => setLightboxImage(item)}
          >
            <Image
              source={thumbUrl(item.id)}
              style={styles.thumbImage}
              resizeMode="cover"
            />
          </Pressable>
        )}
      />

      <Modal
        visible={!!lightboxImage}
        transparent
        animationType="fade"
        onRequestClose={() => setLightboxImage(null)}
      >
        <View style={styles.overlay}>
          {lightboxImage && (
            <>
              <Image
                source={imageUrl(lightboxImage.id)}
                style={styles.fullImage}
                resizeMode="contain"
              />
              <View style={styles.overlayActions}>
                <Pressable
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(lightboxImage)}
                >
                  <Trash2 size={18} color="#fff" />
                </Pressable>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => setLightboxImage(null)}
                >
                  <X size={18} color="#fff" />
                </Pressable>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  empty: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    paddingVertical: 4,
  },
  row: {
    gap: 4,
    marginBottom: 4,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceVariant,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  overlayActions: {
    position: "absolute",
    top: 48,
    right: 16,
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  deleteBtn: {
    backgroundColor: "rgba(180,30,30,0.8)",
  },
});
