import { PRIVACY_CONSENT_PURPOSES, privacyConsentCopy } from "@grwm/shared";
import { Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";

export function SettingsScreen({ authState, logoutPlaceholder, messages, theme }: MobileScreenProps) {
  return (
    <Screen body={messages.screens.settings.body} theme={theme} title={messages.screens.settings.title}>
      <View style={{ gap: 10 }}>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: "800" }}>
          {messages.screens.settings.privacyTitle}
        </Text>
        {PRIVACY_CONSENT_PURPOSES.map((purpose) => (
          <Text key={purpose} style={{ color: theme.textMuted, fontSize: 14, lineHeight: 20 }}>
            {privacyConsentCopy[purpose]}
          </Text>
        ))}
        <Text style={{ color: theme.textMuted, fontSize: 14, lineHeight: 20 }}>
          {messages.screens.settings.accountDeletionCopy}
        </Text>
        <Text style={{ color: theme.textMuted, fontSize: 13 }}>
          {messages.screens.settings.authStateLabel}: {authState.status}
        </Text>
      </View>
      <PrimaryButton onPress={logoutPlaceholder} theme={theme}>
        {messages.screens.settings.logoutAction}
      </PrimaryButton>
    </Screen>
  );
}
