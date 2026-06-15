import {
  WARDROBE_CATEGORY_PREFERENCES,
  type WardrobeCategoryPreference
} from "@grwm/shared";
import { useEffect, useState } from "react";
import { Text } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";
import { ChipGroup, OptionChip } from "../wardrobe/WardrobeSetupControls";
import {
  getWardrobeSetupProfile,
  saveWardrobeSetupDraft
} from "../wardrobe/wardrobeSetupService";

export function WardrobeCategoryPreferencesScreen({
  authState,
  messages,
  navigate,
  theme
}: MobileScreenProps) {
  const userId = authState.user?.id;
  const [selectedCategories, setSelectedCategories] = useState<readonly WardrobeCategoryPreference[]>([]);
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
          setSelectedCategories(profile.selectedCategories);
        }
      })
      .catch(() => {
        if (active) {
          setErrorMessage(messages.screens.wardrobeSetupCategories.loadError);
        }
      });

    return () => {
      active = false;
    };
  }, [messages.screens.wardrobeSetupCategories.loadError, userId]);

  const toggleCategory = (category: WardrobeCategoryPreference) => {
    setSelectedCategories((currentCategories) =>
      currentCategories.includes(category)
        ? currentCategories.filter((currentCategory) => currentCategory !== category)
        : [...currentCategories, category]
    );
  };

  const saveCategories = async () => {
    if (!userId) {
      navigate("login");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await saveWardrobeSetupDraft(userId, { selectedCategories });
      navigate("wardrobeSetupStyle");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : messages.screens.wardrobeSetupCategories.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen
      body={messages.screens.wardrobeSetupCategories.body}
      eyebrow={messages.screens.wardrobeSetupCategories.progress}
      theme={theme}
      title={messages.screens.wardrobeSetupCategories.title}
    >
      <ChipGroup>
        {WARDROBE_CATEGORY_PREFERENCES.map((category) => (
          <OptionChip
            key={category}
            onPress={() => toggleCategory(category)}
            selected={selectedCategories.includes(category)}
            theme={theme}
          >
            {messages.screens.wardrobeSetupCategories.categoryLabels[category]}
          </OptionChip>
        ))}
      </ChipGroup>
      {errorMessage ? (
        <Text accessibilityRole="alert" style={{ color: theme.danger, fontSize: 14, lineHeight: 20 }}>
          {errorMessage}
        </Text>
      ) : null}
      <PrimaryButton disabled={isSubmitting} onPress={saveCategories} theme={theme}>
        {isSubmitting
          ? messages.screens.wardrobeSetupCategories.loadingAction
          : messages.screens.wardrobeSetupCategories.action}
      </PrimaryButton>
    </Screen>
  );
}
