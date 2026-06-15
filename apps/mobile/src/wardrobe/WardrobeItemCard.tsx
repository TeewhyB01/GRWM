import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import type { ThemeTokens } from "../theme";
import { resolveWardrobeItemThumbnailUri } from "./wardrobeUploadService.ts";
import type { WardrobeListItem } from "./wardrobeUploadTypes.ts";

interface WardrobeItemCardCopy {
  analysisOff: string;
  imagePrivateFallback: string;
  statusLabel: string;
}

interface WardrobeItemCardProps {
  copy: WardrobeItemCardCopy;
  item: WardrobeListItem;
  theme: ThemeTokens;
}

export function WardrobeItemCard({ copy, item, theme }: WardrobeItemCardProps) {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void resolveWardrobeItemThumbnailUri(item)
      .then((uri) => {
        if (active) {
          setThumbnailUri(uri);
        }
      })
      .catch(() => {
        if (active) {
          setThumbnailUri(null);
        }
      });

    return () => {
      active = false;
    };
  }, [item]);

  return (
    <View style={[styles.card, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
      {thumbnailUri ? (
        <Image source={{ uri: thumbnailUri }} style={styles.image} />
      ) : (
        <View style={[styles.imageFallback, { borderColor: theme.border }]}>
          <Text style={[styles.fallbackText, { color: theme.textMuted }]}>{copy.imagePrivateFallback}</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.meta, { color: theme.textMuted }]}>
          {item.category} - {item.primaryColour}
        </Text>
        <Text style={[styles.status, { color: item.uploadStatus === "upload_failed" ? theme.danger : theme.text }]}>
          {copy.statusLabel}: {item.uploadStatus}
        </Text>
        <Text style={[styles.meta, { color: theme.textMuted }]}>
          {copy.analysisOff}: {item.analysisStatus}
        </Text>
        {item.notes ? <Text style={[styles.notes, { color: theme.textMuted }]}>{item.notes}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: 4
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12
  },
  fallbackText: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    textAlign: "center"
  },
  image: {
    aspectRatio: 1,
    borderRadius: 8,
    width: 88
  },
  imageFallback: {
    alignItems: "center",
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    padding: 8,
    width: 88
  },
  meta: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20
  },
  notes: {
    fontSize: 13,
    lineHeight: 18
  },
  status: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18
  }
});
