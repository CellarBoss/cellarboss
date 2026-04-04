import { StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Icon } from "react-native-paper";
import { Wine } from "@cellarboss/types";
import { useImageSource } from "@/hooks/use-image-source";
import { WINE_TYPE_COLORS } from "@/lib/constants/wines";

type WineThumbnailProps = {
  imageId?: number;
  wineType: Wine["type"];
};

export function WineThumbnail({ imageId, wineType }: WineThumbnailProps) {
  const { thumbSource } = useImageSource();

  if (imageId != null) {
    return (
      <Image
        source={thumbSource(imageId)}
        style={styles.thumbnail}
        contentFit="cover"
      />
    );
  }

  return (
    <Icon source="bottle-wine" size={40} color={WINE_TYPE_COLORS[wineType]} />
  );
}

const styles = StyleSheet.create({
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 6,
  },
});
