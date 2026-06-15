import { StyleSheet, Text, View } from "react-native";

import type { ThemeTokens } from "../theme";
import { WardrobeItemCard } from "./WardrobeItemCard.tsx";
import type { WardrobeListItem } from "./wardrobeUploadTypes.ts";

interface WardrobeListCopy {
  analysisOff: string;
  emptyBody: string;
  emptyTitle: string;
  imagePrivateFallback: string;
  statusLabel: string;
  title: string;
}

interface WardrobeListProps {
  copy: WardrobeListCopy;
  items: WardrobeListItem[];
  theme: ThemeTokens;
}

export function WardrobeList({ copy, items, theme }: WardrobeListProps) {
  if (items.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>{copy.emptyTitle}</Text>
        <Text style={[styles.body, { color: theme.textMuted }]}>{copy.emptyBody}</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      <Text style={[styles.title, { color: theme.text }]}>{copy.title}</Text>
      {items.map((item) => (
        <WardrobeItemCard
          copy={{
            analysisOff: copy.analysisOff,
            imagePrivateFallback: copy.imagePrivateFallback,
            statusLabel: copy.statusLabel
          }}
          item={item}
          key={item.itemId}
          theme={theme}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 14,
    lineHeight: 20
  },
  empty: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 12
  },
  list: {
    gap: 10
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20
  }
});
