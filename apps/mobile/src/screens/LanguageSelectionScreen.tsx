import { Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";
import { updateUserProfile } from "../profile/profileService";

export function LanguageSelectionScreen({
  authState,
  messages,
  navigate,
  theme,
  updateOnboardingDraft
}: MobileScreenProps) {
  const saveLanguage = async () => {
    updateOnboardingDraft({ locale: "en" });

    if (authState.user) {
      await updateUserProfile({ userId: authState.user.id, locale: "en" });
    }

    navigate("country");
  };

  return (
    <Screen body={messages.screens.language.body} theme={theme} title={messages.screens.language.title}>
      <View style={{ backgroundColor: theme.surfaceMuted, borderRadius: 8, padding: 14 }}>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: "700" }}>
          {messages.screens.language.option}
        </Text>
      </View>
      <PrimaryButton onPress={saveLanguage} theme={theme}>
        {messages.navigation.country}
      </PrimaryButton>
    </Screen>
  );
}
