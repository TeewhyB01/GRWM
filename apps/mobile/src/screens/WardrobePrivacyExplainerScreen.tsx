import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";
import { NoticeBox } from "../wardrobe/WardrobeSetupControls";

export function WardrobePrivacyExplainerScreen({ messages, navigate, theme }: MobileScreenProps) {
  return (
    <Screen
      body={messages.screens.wardrobePrivacyExplainer.body}
      eyebrow={messages.screens.wardrobePrivacyExplainer.progress}
      theme={theme}
      title={messages.screens.wardrobePrivacyExplainer.title}
    >
      <NoticeBox
        body={messages.screens.wardrobePrivacyExplainer.privateBody}
        theme={theme}
        title={messages.screens.wardrobePrivacyExplainer.privateTitle}
      />
      <NoticeBox
        body={messages.screens.wardrobePrivacyExplainer.sharingBody}
        theme={theme}
        title={messages.screens.wardrobePrivacyExplainer.sharingTitle}
      />
      <NoticeBox
        body={messages.screens.wardrobePrivacyExplainer.consentBody}
        theme={theme}
        title={messages.screens.wardrobePrivacyExplainer.consentTitle}
      />
      <PrimaryButton onPress={() => navigate("settings")} theme={theme}>
        {messages.screens.wardrobePrivacyExplainer.settingsAction}
      </PrimaryButton>
      <PrimaryButton onPress={() => navigate("wardrobeSetupCategories")} theme={theme}>
        {messages.screens.wardrobePrivacyExplainer.action}
      </PrimaryButton>
    </Screen>
  );
}
