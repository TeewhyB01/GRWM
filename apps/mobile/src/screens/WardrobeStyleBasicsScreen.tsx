import {
  WARDROBE_COLOUR_FAMILIES,
  WARDROBE_MODESTY_PREFERENCES,
  WARDROBE_OUTFIT_FORMALITIES,
  WARDROBE_SETUP_RELEVANCE_VALUES,
  WARDROBE_TYPICAL_DRESS_CODES,
  type WardrobeColourFamily,
  type WardrobeModestyPreference,
  type WardrobeOutfitFormality,
  type WardrobeSetupRelevance,
  type WardrobeStyleBasics,
  type WardrobeTypicalDressCode
} from "@grwm/shared";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";
import { ChipGroup, OptionChip } from "../wardrobe/WardrobeSetupControls";
import {
  createDefaultWardrobeStyleBasics,
  getWardrobeSetupProfile,
  saveWardrobeSetupDraft
} from "../wardrobe/wardrobeSetupService";

type ColourListField = "favouriteColourFamilies" | "coloursToAvoid";

export function WardrobeStyleBasicsScreen({
  authState,
  messages,
  navigate,
  theme
}: MobileScreenProps) {
  const userId = authState.user?.id;
  const [styleBasics, setStyleBasics] = useState<WardrobeStyleBasics>(createDefaultWardrobeStyleBasics);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    if (!userId) {
      return () => {
        active = false;
      };
    }

    void getWardrobeSetupProfile(userId)
      .then((profile) => {
        if (active && profile) {
          setStyleBasics(profile.styleBasics);
        }
      })
      .catch(() => {
        if (active) {
          setErrorMessage(messages.screens.wardrobeSetupStyle.loadError);
        }
      });

    return () => {
      active = false;
    };
  }, [messages.screens.wardrobeSetupStyle.loadError, userId]);

  const updateStyleBasics = (updates: Partial<WardrobeStyleBasics>) => {
    setStyleBasics((currentStyleBasics) => ({
      ...currentStyleBasics,
      ...updates
    }));
  };

  const toggleColourFamily = (field: ColourListField, colourFamily: WardrobeColourFamily) => {
    setStyleBasics((currentStyleBasics) => {
      const currentValues = currentStyleBasics[field];
      const nextValues = currentValues.includes(colourFamily)
        ? currentValues.filter((currentColourFamily) => currentColourFamily !== colourFamily)
        : [...currentValues, colourFamily];

      return {
        ...currentStyleBasics,
        [field]: nextValues
      };
    });
  };

  const saveStyleBasics = async () => {
    if (!userId) {
      navigate("login");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await saveWardrobeSetupDraft(userId, { styleBasics });
      navigate("wardrobeSetupSummary");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : messages.screens.wardrobeSetupStyle.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen
      body={messages.screens.wardrobeSetupStyle.body}
      eyebrow={messages.screens.wardrobeSetupStyle.progress}
      theme={theme}
      title={messages.screens.wardrobeSetupStyle.title}
    >
      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>
          {messages.screens.wardrobeSetupStyle.dressCodeTitle}
        </Text>
        <ChipGroup>
          {WARDROBE_TYPICAL_DRESS_CODES.map((dressCode) => (
            <OptionChip
              key={dressCode}
              onPress={() =>
                updateStyleBasics({
                  typicalDressCode:
                    styleBasics.typicalDressCode === dressCode ? "" : dressCode as WardrobeTypicalDressCode
                })
              }
              selected={styleBasics.typicalDressCode === dressCode}
              theme={theme}
            >
              {messages.screens.wardrobeSetupStyle.dressCodeLabels[dressCode]}
            </OptionChip>
          ))}
        </ChipGroup>
      </View>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>
          {messages.screens.wardrobeSetupStyle.formalityTitle}
        </Text>
        <ChipGroup>
          {WARDROBE_OUTFIT_FORMALITIES.map((formality) => (
            <OptionChip
              key={formality}
              onPress={() =>
                updateStyleBasics({
                  preferredOutfitFormality:
                    styleBasics.preferredOutfitFormality === formality ? "" : formality as WardrobeOutfitFormality
                })
              }
              selected={styleBasics.preferredOutfitFormality === formality}
              theme={theme}
            >
              {messages.screens.wardrobeSetupStyle.formalityLabels[formality]}
            </OptionChip>
          ))}
        </ChipGroup>
      </View>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>
          {messages.screens.wardrobeSetupStyle.favouriteColoursTitle}
        </Text>
        <ChipGroup>
          {WARDROBE_COLOUR_FAMILIES.map((colourFamily) => (
            <OptionChip
              key={colourFamily}
              onPress={() => toggleColourFamily("favouriteColourFamilies", colourFamily)}
              selected={styleBasics.favouriteColourFamilies.includes(colourFamily)}
              theme={theme}
            >
              {messages.screens.wardrobeSetupStyle.colourLabels[colourFamily]}
            </OptionChip>
          ))}
        </ChipGroup>
      </View>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>
          {messages.screens.wardrobeSetupStyle.avoidColoursTitle}
        </Text>
        <ChipGroup>
          {WARDROBE_COLOUR_FAMILIES.map((colourFamily) => (
            <OptionChip
              key={colourFamily}
              onPress={() => toggleColourFamily("coloursToAvoid", colourFamily)}
              selected={styleBasics.coloursToAvoid.includes(colourFamily)}
              theme={theme}
            >
              {messages.screens.wardrobeSetupStyle.colourLabels[colourFamily]}
            </OptionChip>
          ))}
        </ChipGroup>
      </View>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>
          {messages.screens.wardrobeSetupStyle.modestyTitle}
        </Text>
        <ChipGroup>
          {WARDROBE_MODESTY_PREFERENCES.map((modestyPreference) => (
            <OptionChip
              key={modestyPreference}
              onPress={() =>
                updateStyleBasics({
                  modestyPreference:
                    styleBasics.modestyPreference === modestyPreference
                      ? ""
                      : modestyPreference as WardrobeModestyPreference
                })
              }
              selected={styleBasics.modestyPreference === modestyPreference}
              theme={theme}
            >
              {messages.screens.wardrobeSetupStyle.modestyLabels[modestyPreference]}
            </OptionChip>
          ))}
        </ChipGroup>
      </View>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>
          {messages.screens.wardrobeSetupStyle.workwearTitle}
        </Text>
        <ChipGroup>
          {WARDROBE_SETUP_RELEVANCE_VALUES.map((relevance) => (
            <OptionChip
              key={relevance}
              onPress={() =>
                updateStyleBasics({
                  workwearRelevance: relevance as WardrobeSetupRelevance
                })
              }
              selected={styleBasics.workwearRelevance === relevance}
              theme={theme}
            >
              {messages.screens.wardrobeSetupStyle.relevanceLabels[relevance]}
            </OptionChip>
          ))}
        </ChipGroup>
      </View>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>
          {messages.screens.wardrobeSetupStyle.occasionwearTitle}
        </Text>
        <ChipGroup>
          {WARDROBE_SETUP_RELEVANCE_VALUES.map((relevance) => (
            <OptionChip
              key={relevance}
              onPress={() =>
                updateStyleBasics({
                  occasionwearRelevance: relevance as WardrobeSetupRelevance
                })
              }
              selected={styleBasics.occasionwearRelevance === relevance}
              theme={theme}
            >
              {messages.screens.wardrobeSetupStyle.relevanceLabels[relevance]}
            </OptionChip>
          ))}
        </ChipGroup>
      </View>

      {errorMessage ? (
        <Text accessibilityRole="alert" style={{ color: theme.danger, fontSize: 14, lineHeight: 20 }}>
          {errorMessage}
        </Text>
      ) : null}
      <PrimaryButton disabled={isSubmitting} onPress={saveStyleBasics} theme={theme}>
        {isSubmitting
          ? messages.screens.wardrobeSetupStyle.loadingAction
          : messages.screens.wardrobeSetupStyle.action}
      </PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20
  },
  section: {
    gap: 8
  }
});
