import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import type { ThemeTokens } from "../theme";

interface PrimaryButtonProps {
  children: ReactNode;
  disabled?: boolean;
  onPress: () => void;
  theme: ThemeTokens;
}

export function PrimaryButton({ children, disabled = false, onPress, theme }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.accent, opacity: disabled ? 0.55 : pressed ? 0.82 : 1 }
      ]}
    >
      <Text style={[styles.label, { color: theme.accentText }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 12
  },
  label: {
    fontSize: 16,
    fontWeight: "700"
  }
});
