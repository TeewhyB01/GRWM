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
  recordPrivacyConsent,
  type PrivacyConsentChoices
} from "../privacy/privacyService";

export function PrivacyConsentScreen({
  authState,
  messages,
  navigate,
  theme,
  updateOnboardingDraft
}: MobileScreenProps) {
  const userId = authState.user?.id;
  const [choices, setChoices] = useState<PrivacyConsentChoices>(createPrivacyConsentChoices());
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    if (!userId) {
      return () => {
        active = false;
      };
    }

    void readPrivacyConsent(userId).then((consent) => {
      if (active && consent) {
        setChoices(createPrivacyConsentChoices(consent));
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

  const submitConsent = async () => {
    if (!userId) {
      setErrorMessage("Sign in before saving privacy consent.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await recordPrivacyConsent({
        userId,
        choices
      });
      updateOnboardingDraft({ privacyConsentCompleted: true });
      navigate("onboarding");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save privacy consent.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen body={messages.screens.privacy.body} theme={theme} title={messages.screens.privacy.title}>
      <View style={styles.list}>
        {PRIVACY_CONSENT_PURPOSES.map((purpose) => {
          const isOptional = optionalPrivacyConsentPurposes.includes(purpose);

          return (
            <View
              key={purpose}
              style={[styles.row, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
            >
              <View style={styles.rowText}>
                <Text style={[styles.copy, { color: theme.text }]}>{privacyConsentCopy[purpose]}</Text>
                <Text style={[styles.meta, { color: theme.textMuted }]}>
                  {isOptional ? messages.screens.privacy.optionalLabel : messages.screens.privacy.requiredLabel}
                </Text>
              </View>
              <Switch
                accessibilityLabel={privacyConsentCopy[purpose]}
                onValueChange={(value) => updateChoice(purpose, value)}
                value={choices[purpose]}
              />
            </View>
          );
        })}
        {errorMessage ? (
          <Text accessibilityRole="alert" style={[styles.error, { color: theme.danger }]}>
            {errorMessage}
          </Text>
        ) : null}
      </View>
      <PrimaryButton disabled={isSubmitting} onPress={submitConsent} theme={theme}>
        {isSubmitting ? messages.screens.privacy.loadingAction : messages.screens.privacy.action}
      </PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: {
    fontSize: 14,
    lineHeight: 20
  },
  error: {
    fontSize: 14,
    lineHeight: 20
  },
  list: {
    gap: 10
  },
  meta: {
    fontSize: 12,
    fontWeight: "700"
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
  }
});
