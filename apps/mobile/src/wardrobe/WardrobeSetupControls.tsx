import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ThemeTokens } from "../theme";

interface OptionChipProps {
  children: ReactNode;
  onPress: () => void;
  selected: boolean;
  theme: ThemeTokens;
}

interface NoticeBoxProps {
  body: string;
  title: string;
  theme: ThemeTokens;
}

export function OptionChip({ children, onPress, selected, theme }: OptionChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.accent : theme.surfaceMuted,
          borderColor: selected ? theme.accent : theme.border,
          opacity: pressed ? 0.82 : 1
        }
      ]}
    >
      <Text style={[styles.chipLabel, { color: selected ? theme.accentText : theme.text }]}>
        {children}
      </Text>
    </Pressable>
  );
}

export function NoticeBox({ body, title, theme }: NoticeBoxProps) {
  return (
    <View style={[styles.notice, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
      <Text style={[styles.noticeTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.noticeBody, { color: theme.textMuted }]}>{body}</Text>
    </View>
  );
}

export function ChipGroup({ children }: { children: ReactNode }) {
  return <View style={styles.chipGroup}>{children}</View>;
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  chipGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18
  },
  notice: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 12
  },
  noticeBody: {
    fontSize: 14,
    lineHeight: 20
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20
  }
});
