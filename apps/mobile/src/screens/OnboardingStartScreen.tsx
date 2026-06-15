import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";

export function OnboardingStartScreen({ authState, messages, navigate, theme }: MobileScreenProps) {
  const openWardrobeSetup = () => {
    if (!authState.user) {
      navigate("login");
      return;
    }

    navigate("wardrobeSetupIntro");
  };

  return (
    <Screen
      body={messages.screens.onboarding.body}
      theme={theme}
      title={messages.screens.onboarding.title}
    >
      <PrimaryButton onPress={openWardrobeSetup} theme={theme}>
        {messages.screens.onboarding.action}
      </PrimaryButton>
    </Screen>
  );
}
