import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";

export function WardrobeHomeScreen({ messages, navigate, theme }: MobileScreenProps) {
  return (
    <Screen body={messages.screens.wardrobe.body} theme={theme} title={messages.screens.wardrobe.title}>
      <PrimaryButton onPress={() => navigate("today")} theme={theme}>
        {messages.navigation.today}
      </PrimaryButton>
    </Screen>
  );
}
