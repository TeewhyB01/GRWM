import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import type { ThemeTokens } from "../theme";

interface ScreenProps {
  title: string;
  body: string;
  eyebrow?: string;
  children?: ReactNode;
  theme: ThemeTokens;
}

export function Screen({ title, body, eyebrow, children, theme }: ScreenProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: theme.textMuted }]}>{eyebrow}</Text> : null}
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.body, { color: theme.textMuted }]}>{body}</Text>
        {children ? <View style={styles.actions}>{children}</View> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
    paddingTop: 8
  },
  body: {
    fontSize: 16,
    lineHeight: 24
  },
  container: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 22
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36
  }
});
