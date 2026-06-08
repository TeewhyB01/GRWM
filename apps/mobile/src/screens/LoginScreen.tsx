import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { loginWithEmailPassword } from "../auth/authService";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";

export function LoginScreen({ messages, navigate, theme }: MobileScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLogin = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await loginWithEmailPassword({
        email: email.trim(),
        password
      });
      navigate("wardrobe");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen body={messages.screens.login.body} theme={theme} title={messages.screens.login.title}>
      <View style={styles.form}>
        <TextInput
          accessibilityLabel={messages.screens.login.emailLabel}
          autoCapitalize="none"
          inputMode="email"
          onChangeText={setEmail}
          placeholder={messages.screens.login.emailLabel}
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          value={email}
        />
        <TextInput
          accessibilityLabel={messages.screens.login.passwordLabel}
          onChangeText={setPassword}
          placeholder={messages.screens.login.passwordLabel}
          placeholderTextColor={theme.textMuted}
          secureTextEntry
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          value={password}
        />
        {errorMessage ? (
          <Text accessibilityRole="alert" style={[styles.error, { color: theme.danger }]}>
            {errorMessage}
          </Text>
        ) : null}
      </View>
      <PrimaryButton disabled={isSubmitting} onPress={submitLogin} theme={theme}>
        {isSubmitting ? messages.screens.login.loadingAction : messages.screens.login.action}
      </PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    fontSize: 14,
    lineHeight: 20
  },
  form: {
    gap: 10
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14
  }
});
