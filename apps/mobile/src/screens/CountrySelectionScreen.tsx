import { Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";
import { updateUserProfile } from "../profile/profileService";

export function CountrySelectionScreen({
  authState,
  messages,
  navigate,
  theme,
  updateOnboardingDraft
}: MobileScreenProps) {
  const saveCountry = async () => {
    updateOnboardingDraft({ countryCode: "GB" });

    if (authState.user) {
      await updateUserProfile({ userId: authState.user.id, countryCode: "GB" });
      navigate("onboarding");
      return;
    }

    navigate("signUp");
  };

  return (
    <Screen body={messages.screens.country.body} theme={theme} title={messages.screens.country.title}>
      <View style={{ backgroundColor: theme.surfaceMuted, borderRadius: 8, padding: 14 }}>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: "700" }}>
          {messages.screens.country.option}
        </Text>
      </View>
      <PrimaryButton onPress={saveCountry} theme={theme}>
        {authState.user ? messages.navigation.onboarding : messages.navigation.signUp}
      </PrimaryButton>
    </Screen>
  );
}
