import { Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";

export function LanguageSelectionScreen({ messages, navigate, theme }: MobileScreenProps) {
  return (
    <Screen body={messages.screens.language.body} theme={theme} title={messages.screens.language.title}>
      <View style={{ backgroundColor: theme.surfaceMuted, borderRadius: 8, padding: 14 }}>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: "700" }}>
          {messages.screens.language.option}
        </Text>
      </View>
      <PrimaryButton onPress={() => navigate("country")} theme={theme}>
        {messages.navigation.country}
      </PrimaryButton>
    </Screen>
  );
}
