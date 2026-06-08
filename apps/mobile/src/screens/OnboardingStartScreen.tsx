import { useState } from "react";
import { Text } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";
import { saveOnboardingPreferencePlaceholders } from "../profile/profileService";

export function OnboardingStartScreen({ authState, messages, navigate, theme }: MobileScreenProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openWardrobe = async () => {
    if (!authState.user) {
      navigate("login");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await saveOnboardingPreferencePlaceholders({ userId: authState.user.id });
      navigate("wardrobe");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save onboarding preferences.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen
      body={messages.screens.onboarding.body}
      theme={theme}
      title={messages.screens.onboarding.title}
    >
      {errorMessage ? (
        <Text accessibilityRole="alert" style={{ color: theme.danger, fontSize: 14, lineHeight: 20 }}>
          {errorMessage}
        </Text>
      ) : null}
      <PrimaryButton disabled={isSubmitting} onPress={openWardrobe} theme={theme}>
        {messages.screens.onboarding.action}
      </PrimaryButton>
    </Screen>
  );
}
