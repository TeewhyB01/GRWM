import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { signUpWithEmailPassword } from "../auth/authService";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";

export function SignUpScreen({
  messages,
  navigate,
  onboardingDraft,
  theme,
  updateOnboardingDraft
}: MobileScreenProps) {
  const [displayName, setDisplayName] = useState(onboardingDraft.displayName);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitSignUp = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const nextDisplayName = displayName.trim();

      await signUpWithEmailPassword({
        email: email.trim(),
        password,
        profile: {
          displayName: nextDisplayName,
          locale: onboardingDraft.locale,
          countryCode: onboardingDraft.countryCode
        }
      });
      updateOnboardingDraft({ displayName: nextDisplayName });
      navigate("privacy");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen body={messages.screens.signUp.body} theme={theme} title={messages.screens.signUp.title}>
      <View style={styles.form}>
        <TextInput
          accessibilityLabel={messages.screens.signUp.displayNameLabel}
          onChangeText={setDisplayName}
          placeholder={messages.screens.signUp.displayNameLabel}
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          value={displayName}
        />
        <TextInput
          accessibilityLabel={messages.screens.signUp.emailLabel}
          autoCapitalize="none"
          inputMode="email"
          onChangeText={setEmail}
          placeholder={messages.screens.signUp.emailLabel}
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          value={email}
        />
        <TextInput
          accessibilityLabel={messages.screens.signUp.passwordLabel}
          onChangeText={setPassword}
          placeholder={messages.screens.signUp.passwordLabel}
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
      <PrimaryButton disabled={isSubmitting} onPress={submitSignUp} theme={theme}>
        {isSubmitting ? messages.screens.signUp.loadingAction : messages.screens.signUp.action}
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
