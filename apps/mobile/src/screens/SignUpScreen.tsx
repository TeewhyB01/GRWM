import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";

export function SignUpScreen({ messages, navigate, theme }: MobileScreenProps) {
  return (
    <Screen body={messages.screens.signUp.body} theme={theme} title={messages.screens.signUp.title}>
      <PrimaryButton onPress={() => navigate("language")} theme={theme}>
        {messages.screens.signUp.action}
      </PrimaryButton>
    </Screen>
  );
}
