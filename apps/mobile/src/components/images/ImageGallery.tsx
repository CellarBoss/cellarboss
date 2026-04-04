import {
  View,
  FlatList,
  Pressable,
  Modal,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Text, ActivityIndicator } from "react-native-paper";
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/use-api-query";
import { useImageSource } from "@/hooks/use-image-source";
import { api } from "@/lib/api/client";
import { theme } from "@/lib/theme";
import type { Image as ImageType } from "@cellarboss/types";
import { useState } from "react";
import { X, Trash2, Star } from "lucide-react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const THUMB_SIZE = (SCREEN_WIDTH - 48) / 3; // 3 columns with padding

type Props = { vintageId: number };

export function ImageGallery({ vintageId }: Props) {
  const queryClient = useQueryClient();
  const [lightboxImage, setLightboxImage] = useState<ImageType | null>(null);
  const { thumbSource, fullSource } = useImageSource();

  const imagesQuery = useApiQuery({
    queryKey: ["images", vintageId],
    queryFn: () => api.images.getByVintageId(vintageId),
  });

  const images = imagesQuery.data ?? [];

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

  async function handleToggleFavourite(image: ImageType) {
    if (image.isFavourite) {
      const result = await api.images.unsetFavourite(image.id);
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["images", vintageId] });
        if (lightboxImage?.id === image.id)
          setLightboxImage({ ...image, isFavourite: false });
      }
    } else {
      const result = await api.images.setFavourite(image.id);
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["images", vintageId] });
        if (lightboxImage?.id === image.id)
          setLightboxImage({ ...image, isFavourite: true });
      }
    }
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
              source={thumbSource(item.id)}
              style={styles.thumbImage}
              contentFit="cover"
            />
            {item.isFavourite && (
              <View style={styles.favouriteBadge}>
                <Star size={10} color="gold" fill="gold" />
              </View>
            )}
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
                source={fullSource(lightboxImage.id)}
                style={styles.fullImage}
                contentFit="contain"
              />
              <View style={styles.overlayActions}>
                <Pressable
                  style={[
                    styles.actionBtn,
                    lightboxImage.isFavourite && styles.favouriteActiveBtn,
                  ]}
                  onPress={() => handleToggleFavourite(lightboxImage)}
                >
                  <Star
                    size={18}
                    color={lightboxImage.isFavourite ? "gold" : "#fff"}
                    fill={lightboxImage.isFavourite ? "gold" : "none"}
                  />
                </Pressable>
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
  favouriteBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    padding: 2,
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
  favouriteActiveBtn: {
    backgroundColor: "rgba(0,0,0,0.6)",
  },
});
