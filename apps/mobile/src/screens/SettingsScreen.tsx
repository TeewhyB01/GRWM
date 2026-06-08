import {
  PRIVACY_CONSENT_PURPOSES,
  privacyConsentCopy,
  type PrivacyConsentPurpose
} from "@grwm/shared";
import { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";
import {
  createPrivacyConsentChoices,
  optionalPrivacyConsentPurposes,
  readPrivacyConsent,
  requestAccountDataDeletion,
  updatePrivacyConsentChoices,
  type PrivacyConsentChoices
} from "../privacy/privacyService";

export function SettingsScreen({ authState, logout, messages, theme }: MobileScreenProps) {
  const userId = authState.user?.id;
  const [choices, setChoices] = useState<PrivacyConsentChoices>(createPrivacyConsentChoices());
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSavingConsent, setIsSavingConsent] = useState(false);
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false);

  useEffect(() => {
    let active = true;

    if (!userId) {
      return () => {
        active = false;
      };
    }

    void readPrivacyConsent(userId).then((consent) => {
      if (active) {
        setChoices(createPrivacyConsentChoices(consent ?? undefined));
      }
    });

    return () => {
      active = false;
    };
  }, [userId]);

  const updateChoice = (purpose: PrivacyConsentPurpose, value: boolean) => {
    setChoices((currentChoices) => ({
      ...currentChoices,
      [purpose]: value
    }));
  };

  const saveConsent = async () => {
    if (!userId) {
      setErrorMessage("Sign in before updating privacy consent.");
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setIsSavingConsent(true);

    try {
      await updatePrivacyConsentChoices({
        userId,
        choices
      });
      setStatusMessage(messages.screens.settings.saveConsentAction);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update privacy consent.");
    } finally {
      setIsSavingConsent(false);
    }
  };

  const requestDeletion = async () => {
    if (!userId) {
      setErrorMessage("Sign in before requesting account deletion.");
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setIsRequestingDeletion(true);

    try {
      await requestAccountDataDeletion({ userId });
      setStatusMessage(messages.screens.settings.deletionRequestedTitle);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to request account deletion.");
    } finally {
      setIsRequestingDeletion(false);
    }
  };

  return (
    <Screen body={messages.screens.settings.body} theme={theme} title={messages.screens.settings.title}>
      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>
          {messages.screens.settings.privacyTitle}
        </Text>
        {PRIVACY_CONSENT_PURPOSES.map((purpose) => (
          <View
            key={purpose}
            style={[styles.row, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
          >
            <View style={styles.rowText}>
              <Text style={[styles.copy, { color: theme.text }]}>{privacyConsentCopy[purpose]}</Text>
              <Text style={[styles.meta, { color: theme.textMuted }]}>
                {optionalPrivacyConsentPurposes.includes(purpose)
                  ? messages.screens.privacy.optionalLabel
                  : messages.screens.privacy.requiredLabel}
                {" - "}
                {choices[purpose]
                  ? messages.screens.settings.consentOnLabel
                  : messages.screens.settings.consentOffLabel}
              </Text>
            </View>
            <Switch
              accessibilityLabel={privacyConsentCopy[purpose]}
              onValueChange={(value) => updateChoice(purpose, value)}
              value={choices[purpose]}
            />
          </View>
        ))}
        {statusMessage ? <Text style={[styles.meta, { color: theme.text }]}>{statusMessage}</Text> : null}
        {errorMessage ? (
          <Text accessibilityRole="alert" style={[styles.copy, { color: theme.danger }]}>
            {errorMessage}
          </Text>
        ) : null}
      </View>
      <PrimaryButton disabled={isSavingConsent} onPress={saveConsent} theme={theme}>
        {isSavingConsent
          ? messages.screens.settings.savingConsentAction
          : messages.screens.settings.saveConsentAction}
      </PrimaryButton>
      <View style={styles.section}>
        <Text style={[styles.copy, { color: theme.textMuted }]}>
          {messages.screens.settings.accountDeletionCopy}
        </Text>
      </View>
      <PrimaryButton disabled={isRequestingDeletion} onPress={requestDeletion} theme={theme}>
        {messages.screens.settings.deletionAction}
      </PrimaryButton>
      <View style={styles.section}>
        <Text style={[styles.meta, { color: theme.textMuted }]}>
          {messages.screens.settings.authStateLabel}: {authState.status}
        </Text>
      </View>
      <PrimaryButton onPress={logout} theme={theme}>
        {messages.screens.settings.logoutAction}
      </PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: {
    fontSize: 14,
    lineHeight: 20
  },
  heading: {
    fontSize: 16,
    fontWeight: "800"
  },
  meta: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  },
  row: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 12
  },
  rowText: {
    flex: 1,
    gap: 4
  },
  section: {
    gap: 10
  }
});
