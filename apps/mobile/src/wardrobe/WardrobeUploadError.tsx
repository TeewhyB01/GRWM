import { StyleSheet, Text, View } from "react-native";

import type { ThemeTokens } from "../theme";

interface WardrobeUploadErrorProps {
  message: string;
  theme: ThemeTokens;
  title: string;
}

export function WardrobeUploadError({ message, theme, title }: WardrobeUploadErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <View
      accessibilityRole="alert"
      style={[styles.container, { backgroundColor: theme.surfaceMuted, borderColor: theme.danger }]}
    >
      <Text style={[styles.title, { color: theme.danger }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 12
  },
  message: {
    fontSize: 14,
    lineHeight: 20
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20
  }
});
