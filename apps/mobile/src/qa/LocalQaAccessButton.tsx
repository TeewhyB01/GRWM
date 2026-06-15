import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton.tsx";
import type { MobileMessages } from "../i18n/index.ts";
import type { ThemeTokens } from "../theme/index.ts";
import { continueWithLocalQaAccount, isQaAccessEnabled } from "./qaAccess.ts";

interface LocalQaAccessButtonProps {
  messages: MobileMessages;
  theme: ThemeTokens;
}

export function LocalQaAccessButton({ messages, theme }: LocalQaAccessButtonProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isQaAccessEnabled()) {
    return null;
  }

  const submitLocalQaAccess = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await continueWithLocalQaAccount();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : messages.screens.qaAccess.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <Text style={[styles.copy, { color: theme.textMuted }]}>
        {messages.screens.qaAccess.copy}
      </Text>
      {errorMessage ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: theme.danger }]}>
          {errorMessage}
        </Text>
      ) : null}
      <PrimaryButton disabled={isSubmitting} onPress={submitLocalQaAccess} theme={theme}>
        {isSubmitting ? messages.screens.qaAccess.loadingAction : messages.screens.qaAccess.action}
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    gap: 8,
    marginTop: 4,
    paddingTop: 12
  },
  copy: {
    fontSize: 12,
    lineHeight: 18
  },
  error: {
    fontSize: 14,
    lineHeight: 20
  }
});
