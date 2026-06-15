import { useState } from "react";
import { Text } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";
import { NoticeBox } from "../wardrobe/WardrobeSetupControls";
import { saveWardrobeSetupDraft } from "../wardrobe/wardrobeSetupService";

export function WardrobeSetupIntroScreen({ authState, messages, navigate, theme }: MobileScreenProps) {
  const userId = authState.user?.id;
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const continueSetup = async () => {
    if (!userId) {
      navigate("login");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await saveWardrobeSetupDraft(userId, {});
      navigate("wardrobeSetupPrivacy");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : messages.screens.wardrobeSetupIntro.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen
      body={messages.screens.wardrobeSetupIntro.body}
      eyebrow={messages.screens.wardrobeSetupIntro.progress}
      theme={theme}
      title={messages.screens.wardrobeSetupIntro.title}
    >
      <NoticeBox
        body={messages.screens.wardrobeSetupIntro.privateBody}
        theme={theme}
        title={messages.screens.wardrobeSetupIntro.privateTitle}
      />
      <NoticeBox
        body={messages.screens.wardrobeSetupIntro.consentBody}
        theme={theme}
        title={messages.screens.wardrobeSetupIntro.consentTitle}
      />
      {errorMessage ? (
        <Text accessibilityRole="alert" style={{ color: theme.danger, fontSize: 14, lineHeight: 20 }}>
          {errorMessage}
        </Text>
      ) : null}
      <PrimaryButton disabled={isSubmitting} onPress={continueSetup} theme={theme}>
        {isSubmitting
          ? messages.screens.wardrobeSetupIntro.loadingAction
          : messages.screens.wardrobeSetupIntro.action}
      </PrimaryButton>
    </Screen>
  );
}
