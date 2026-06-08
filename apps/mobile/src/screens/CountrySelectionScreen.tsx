import { Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";

export function CountrySelectionScreen({ messages, navigate, theme }: MobileScreenProps) {
  return (
    <Screen body={messages.screens.country.body} theme={theme} title={messages.screens.country.title}>
      <View style={{ backgroundColor: theme.surfaceMuted, borderRadius: 8, padding: 14 }}>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: "700" }}>
          {messages.screens.country.option}
        </Text>
      </View>
      <PrimaryButton onPress={() => navigate("onboarding")} theme={theme}>
        {messages.navigation.onboarding}
      </PrimaryButton>
    </Screen>
  );
}
