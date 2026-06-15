import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";
import { LocalQaAccessButton } from "../qa/LocalQaAccessButton";

export function WelcomeScreen({ messages, navigate, theme }: MobileScreenProps) {
  return (
    <Screen
      body={messages.screens.welcome.body}
      eyebrow={messages.appName}
      theme={theme}
      title={messages.screens.welcome.title}
    >
      <PrimaryButton onPress={() => navigate("language")} theme={theme}>
        {messages.screens.welcome.action}
      </PrimaryButton>
      <LocalQaAccessButton messages={messages} theme={theme} />
    </Screen>
  );
}
