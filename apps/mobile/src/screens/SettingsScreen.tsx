import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";

export function SettingsScreen({ messages, theme }: MobileScreenProps) {
  return (
    <Screen body={messages.screens.settings.body} theme={theme} title={messages.screens.settings.title} />
  );
}
