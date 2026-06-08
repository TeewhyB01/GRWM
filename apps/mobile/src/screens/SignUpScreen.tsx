import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";

export function SignUpScreen({ completeAuthPlaceholder, messages, theme }: MobileScreenProps) {
  return (
    <Screen body={messages.screens.signUp.body} theme={theme} title={messages.screens.signUp.title}>
      <PrimaryButton onPress={() => completeAuthPlaceholder("language")} theme={theme}>
        {messages.screens.signUp.action}
      </PrimaryButton>
    </Screen>
  );
}
