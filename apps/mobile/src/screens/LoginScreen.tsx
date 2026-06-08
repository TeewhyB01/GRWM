import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";

export function LoginScreen({ messages, navigate, theme }: MobileScreenProps) {
  return (
    <Screen body={messages.screens.login.body} theme={theme} title={messages.screens.login.title}>
      <PrimaryButton onPress={() => navigate("wardrobe")} theme={theme}>
        {messages.screens.login.action}
      </PrimaryButton>
    </Screen>
  );
}
