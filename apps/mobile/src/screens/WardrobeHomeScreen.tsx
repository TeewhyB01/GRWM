import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";
import { NoticeBox } from "../wardrobe/WardrobeSetupControls";
import { getWardrobeSetupProfile } from "../wardrobe/wardrobeSetupService";
import type { WardrobeSetupProfile } from "../wardrobe/wardrobeSetupTypes";

export function WardrobeHomeScreen({ authState, messages, navigate, theme }: MobileScreenProps) {
  const userId = authState.user?.id;
  const [setupProfile, setSetupProfile] = useState<WardrobeSetupProfile | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let active = true;

    if (!userId) {
      return () => {
        active = false;
      };
    }

    void getWardrobeSetupProfile(userId)
      .then((profile) => {
        if (active) {
          setSetupProfile(profile);
        }
      })
      .catch(() => {
        if (active) {
          setStatusMessage(messages.screens.wardrobe.setupLoadError);
        }
      });

    return () => {
      active = false;
    };
  }, [messages.screens.wardrobe.setupLoadError, userId]);

  const setupStatus = setupProfile?.setupStatus ?? "not_started";
  const setupActionLabel =
    setupStatus === "completed"
      ? messages.screens.wardrobe.reviewSetupAction
      : messages.screens.wardrobe.setupAction;

  return (
    <Screen body={messages.screens.wardrobe.body} theme={theme} title={messages.screens.wardrobe.title}>
      <NoticeBox
        body={messages.screens.wardrobe.emptyStateBody}
        theme={theme}
        title={messages.screens.wardrobe.emptyStateTitle}
      />
      <View style={styles.statusRow}>
        <Text style={[styles.statusLabel, { color: theme.textMuted }]}>
          {messages.screens.wardrobe.setupStatusLabel}
        </Text>
        <Text style={[styles.statusValue, { color: theme.text }]}>
          {messages.screens.wardrobe.setupStatusLabels[setupStatus]}
        </Text>
      </View>
      {statusMessage ? (
        <Text accessibilityRole="alert" style={{ color: theme.danger, fontSize: 14, lineHeight: 20 }}>
          {statusMessage}
        </Text>
      ) : null}
      <PrimaryButton
        onPress={() =>
          navigate(setupStatus === "completed" ? "wardrobeSetupSummary" : "wardrobeSetupIntro")
        }
        theme={theme}
      >
        {setupActionLabel}
      </PrimaryButton>
      <PrimaryButton disabled onPress={() => undefined} theme={theme}>
        {messages.screens.wardrobe.addSoonAction}
      </PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusLabel: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  },
  statusRow: {
    gap: 4
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22
  }
});
