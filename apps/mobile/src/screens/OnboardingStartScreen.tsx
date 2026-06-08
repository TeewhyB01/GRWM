import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";

export function OnboardingStartScreen({ messages, navigate, theme }: MobileScreenProps) {
  return (
    <Screen
      body={messages.screens.onboarding.body}
      theme={theme}
      title={messages.screens.onboarding.title}
    >
      <PrimaryButton onPress={() => navigate("wardrobe")} theme={theme}>
        {messages.screens.onboarding.action}
      </PrimaryButton>
    </Screen>
  );
}
