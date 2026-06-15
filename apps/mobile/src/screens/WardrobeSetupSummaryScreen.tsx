import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";
import { NoticeBox } from "../wardrobe/WardrobeSetupControls";
import {
  completeWardrobeSetup,
  createDefaultWardrobeStyleBasics,
  getWardrobeSetupProfile
} from "../wardrobe/wardrobeSetupService";
import type { WardrobeSetupProfile, WardrobeStyleBasics } from "../wardrobe/wardrobeSetupTypes";

export function WardrobeSetupSummaryScreen({
  authState,
  messages,
  navigate,
  theme
}: MobileScreenProps) {
  const userId = authState.user?.id;
  const [profile, setProfile] = useState<WardrobeSetupProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const styleBasics = profile?.styleBasics ?? createDefaultWardrobeStyleBasics();
  const selectedCategories = profile?.selectedCategories ?? [];

  useEffect(() => {
    let active = true;

    if (!userId) {
      return () => {
        active = false;
      };
    }

    void getWardrobeSetupProfile(userId)
      .then((setupProfile) => {
        if (active) {
          setProfile(setupProfile);
        }
      })
      .catch(() => {
        if (active) {
          setErrorMessage(messages.screens.wardrobeSetupSummary.loadError);
        }
      });

    return () => {
      active = false;
    };
  }, [messages.screens.wardrobeSetupSummary.loadError, userId]);

  const completeSetup = async () => {
    if (!userId) {
      navigate("login");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const completedProfile = await completeWardrobeSetup(userId, {
        selectedCategories,
        styleBasics
      });

      setProfile(completedProfile);
      navigate("wardrobe");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : messages.screens.wardrobeSetupSummary.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categorySummary = selectedCategories.length
    ? selectedCategories
        .map((category) => messages.screens.wardrobeSetupCategories.categoryLabels[category])
        .join(", ")
    : messages.screens.wardrobeSetupSummary.emptyCategories;

  return (
    <Screen
      body={messages.screens.wardrobeSetupSummary.body}
      eyebrow={messages.screens.wardrobeSetupSummary.progress}
      theme={theme}
      title={messages.screens.wardrobeSetupSummary.title}
    >
      <NoticeBox
        body={messages.screens.wardrobeSetupSummary.privacyBody}
        theme={theme}
        title={messages.screens.wardrobeSetupSummary.privacyTitle}
      />
      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>
          {messages.screens.wardrobeSetupSummary.categoriesTitle}
        </Text>
        <Text style={[styles.copy, { color: theme.textMuted }]}>{categorySummary}</Text>
      </View>
      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>
          {messages.screens.wardrobeSetupSummary.styleTitle}
        </Text>
        <Text style={[styles.copy, { color: theme.textMuted }]}>
          {formatStyleBasics(styleBasics, messages)}
        </Text>
      </View>
      {errorMessage ? (
        <Text accessibilityRole="alert" style={{ color: theme.danger, fontSize: 14, lineHeight: 20 }}>
          {errorMessage}
        </Text>
      ) : null}
      <PrimaryButton onPress={() => navigate("wardrobeSetupCategories")} theme={theme}>
        {messages.screens.wardrobeSetupSummary.editCategoriesAction}
      </PrimaryButton>
      <PrimaryButton onPress={() => navigate("wardrobeSetupStyle")} theme={theme}>
        {messages.screens.wardrobeSetupSummary.editStyleAction}
      </PrimaryButton>
      <PrimaryButton disabled={isSubmitting} onPress={completeSetup} theme={theme}>
        {isSubmitting
          ? messages.screens.wardrobeSetupSummary.loadingAction
          : messages.screens.wardrobeSetupSummary.action}
      </PrimaryButton>
    </Screen>
  );
}

function formatStyleBasics(styleBasics: WardrobeStyleBasics, messages: MobileScreenProps["messages"]): string {
  const styleMessages = messages.screens.wardrobeSetupStyle;
  const dressCode = styleBasics.typicalDressCode
    ? styleMessages.dressCodeLabels[styleBasics.typicalDressCode]
    : messages.screens.wardrobeSetupSummary.notSetLabel;
  const formality = styleBasics.preferredOutfitFormality
    ? styleMessages.formalityLabels[styleBasics.preferredOutfitFormality]
    : messages.screens.wardrobeSetupSummary.notSetLabel;
  const modesty = styleBasics.modestyPreference
    ? styleMessages.modestyLabels[styleBasics.modestyPreference]
    : messages.screens.wardrobeSetupSummary.notSetLabel;
  const favourites = styleBasics.favouriteColourFamilies.length
    ? styleBasics.favouriteColourFamilies
        .map((colourFamily) => styleMessages.colourLabels[colourFamily])
        .join(", ")
    : messages.screens.wardrobeSetupSummary.notSetLabel;
  const avoided = styleBasics.coloursToAvoid.length
    ? styleBasics.coloursToAvoid
        .map((colourFamily) => styleMessages.colourLabels[colourFamily])
        .join(", ")
    : messages.screens.wardrobeSetupSummary.notSetLabel;

  return [
    `${styleMessages.dressCodeTitle}: ${dressCode}`,
    `${styleMessages.formalityTitle}: ${formality}`,
    `${styleMessages.favouriteColoursTitle}: ${favourites}`,
    `${styleMessages.avoidColoursTitle}: ${avoided}`,
    `${styleMessages.modestyTitle}: ${modesty}`,
    `${styleMessages.workwearTitle}: ${styleMessages.relevanceLabels[styleBasics.workwearRelevance]}`,
    `${styleMessages.occasionwearTitle}: ${styleMessages.relevanceLabels[styleBasics.occasionwearRelevance]}`
  ].join("\n");
}

const styles = StyleSheet.create({
  copy: {
    fontSize: 14,
    lineHeight: 21
  },
  heading: {
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20
  },
  section: {
    gap: 6
  }
});
