import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";

export function TodaysOutfitScreen({ messages, navigate, theme }: MobileScreenProps) {
  return (
    <Screen body={messages.screens.today.body} theme={theme} title={messages.screens.today.title}>
      <PrimaryButton onPress={() => navigate("settings")} theme={theme}>
        {messages.navigation.settings}
      </PrimaryButton>
    </Screen>
  );
}
