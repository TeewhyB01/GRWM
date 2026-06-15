import * as ImagePicker from "expo-image-picker";
import { Image, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import type { ThemeTokens } from "../theme";
import type { WardrobeImageAssetInput } from "./wardrobeUploadTypes.ts";

interface WardrobeImagePickerCopy {
  action: string;
  changeAction: string;
  permissionDenied: string;
  selectedLabel: string;
  title: string;
}

interface WardrobeImagePickerSectionProps {
  asset: WardrobeImageAssetInput | null;
  copy: WardrobeImagePickerCopy;
  disabled?: boolean;
  onAssetSelected: (asset: WardrobeImageAssetInput) => void;
  onError: (message: string) => void;
  theme: ThemeTokens;
}

export function WardrobeImagePickerSection({
  asset,
  copy,
  disabled = false,
  onAssetSelected,
  onError,
  theme
}: WardrobeImagePickerSectionProps) {
  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      onError(copy.permissionDenied);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      allowsMultipleSelection: false,
      base64: false,
      exif: false,
      mediaTypes: ["images"],
      quality: 0.92
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const selectedAsset = result.assets[0];
    const uploadAsset: WardrobeImageAssetInput = {
      uri: selectedAsset.uri
    };

    if (selectedAsset.fileName !== null && selectedAsset.fileName !== undefined) {
      uploadAsset.fileName = selectedAsset.fileName;
    }

    if (selectedAsset.fileSize !== null && selectedAsset.fileSize !== undefined) {
      uploadAsset.fileSize = selectedAsset.fileSize;
    }

    if (selectedAsset.mimeType !== null && selectedAsset.mimeType !== undefined) {
      uploadAsset.mimeType = selectedAsset.mimeType;
    }

    if (selectedAsset.type !== null && selectedAsset.type !== undefined) {
      uploadAsset.type = selectedAsset.type;
    }

    onAssetSelected(uploadAsset);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>{copy.title}</Text>
      {asset ? (
        <View style={styles.previewRow}>
          <Image accessibilityLabel={copy.selectedLabel} source={{ uri: asset.uri }} style={styles.preview} />
          <View style={styles.previewText}>
            <Text style={[styles.selectedLabel, { color: theme.text }]}>{copy.selectedLabel}</Text>
            <Text numberOfLines={1} style={[styles.meta, { color: theme.textMuted }]}>
              {asset.fileName || asset.mimeType || "Selected image"}
            </Text>
          </View>
        </View>
      ) : null}
      <PrimaryButton disabled={disabled} onPress={chooseImage} theme={theme}>
        {asset ? copy.changeAction : copy.action}
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12
  },
  meta: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16
  },
  preview: {
    aspectRatio: 1,
    borderRadius: 8,
    width: 84
  },
  previewRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  previewText: {
    flex: 1,
    gap: 4
  },
  selectedLabel: {
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20
  }
});
