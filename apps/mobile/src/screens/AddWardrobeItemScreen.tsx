import { WARDROBE_CATEGORIES, type WardrobeCategory } from "@grwm/shared";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { MobileScreenProps } from "../navigation/types";
import { readPrivacyConsent } from "../privacy/privacyService";
import { NoticeBox, OptionChip } from "../wardrobe/WardrobeSetupControls";
import { WardrobeImagePickerSection } from "../wardrobe/WardrobeImagePickerSection";
import { WardrobeUploadError } from "../wardrobe/WardrobeUploadError";
import { WardrobeUploadProgress } from "../wardrobe/WardrobeUploadProgress";
import {
  listenToWardrobeItem,
  startWardrobeImageUpload,
  validateWardrobeImageSelection
} from "../wardrobe/wardrobeUploadService";
import { getWardrobeSetupProfile } from "../wardrobe/wardrobeSetupService";
import type {
  WardrobeImageAssetInput,
  WardrobeUploadOperation,
  WardrobeUploadPhase,
  WardrobeUploadProgressSnapshot
} from "../wardrobe/wardrobeUploadTypes";
import type { WardrobeSetupStatus } from "../wardrobe/wardrobeSetupTypes";

const colourOptions = [
  { label: "Black", value: "black", swatch: "#111111" },
  { label: "White", value: "white", swatch: "#F8F8F8" },
  { label: "Navy", value: "navy", swatch: "#172554" },
  { label: "Blue", value: "blue", swatch: "#2563EB" },
  { label: "Green", value: "green", swatch: "#15803D" },
  { label: "Red", value: "red", swatch: "#B91C1C" },
  { label: "Pink", value: "pink", swatch: "#DB2777" },
  { label: "Cream", value: "cream", swatch: "#F4E8C1" },
  { label: "Brown", value: "brown", swatch: "#7C2D12" },
  { label: "Grey", value: "grey", swatch: "#6B7280" }
] as const;

export function AddWardrobeItemScreen({ authState, messages, navigate, theme }: MobileScreenProps) {
  const userId = authState.user?.id ?? null;
  const operationRef = useRef<WardrobeUploadOperation | null>(null);
  const [setupStatus, setSetupStatus] = useState<WardrobeSetupStatus | "checking">("checking");
  const [asset, setAsset] = useState<WardrobeImageAssetInput | null>(null);
  const [category, setCategory] = useState<WardrobeCategory | "">("");
  const [primaryColour, setPrimaryColour] = useState("");
  const [notes, setNotes] = useState("");
  const [phase, setPhase] = useState<WardrobeUploadPhase>("idle");
  const [progress, setProgress] = useState<WardrobeUploadProgressSnapshot | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedItemId, setUploadedItemId] = useState<string | null>(null);
  const copy = messages.screens.addWardrobeItem;
  const isBusy = ["validating", "draft", "uploading", "processing"].includes(phase);

  useEffect(() => {
    let active = true;

    if (!userId) {
      setSetupStatus("checking");
      return () => {
        active = false;
      };
    }

    void getWardrobeSetupProfile(userId)
      .then((profile) => {
        if (active) {
          setSetupStatus(profile?.setupStatus ?? "not_started");
        }
      })
      .catch(() => {
        if (active) {
          setSetupStatus("not_started");
        }
      });

    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!uploadedItemId || !userId) {
      return undefined;
    }

    return listenToWardrobeItem({
      itemId: uploadedItemId,
      onError() {
        setErrorMessage(copy.processingError);
      },
      onItem(item) {
        if (item?.uploadStatus === "uploaded") {
          setPhase("uploaded");
          setProgress({ bytesTransferred: 1, percent: 100, totalBytes: 1 });
        }

        if (item?.uploadStatus === "upload_failed") {
          setPhase("failed");
          setErrorMessage(copy.uploadFailed);
        }
      },
      userId
    });
  }, [copy.processingError, copy.uploadFailed, uploadedItemId, userId]);

  useEffect(() => {
    if (phase !== "processing") {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setPhase((currentPhase) => (currentPhase === "processing" ? "saved_processing" : currentPhase));
    }, 30_000);

    return () => clearTimeout(timeoutId);
  }, [phase]);

  const resetForRetry = () => {
    setErrorMessage("");
    setPhase("idle");
    setProgress(null);
    setUploadedItemId(null);
  };

  const cancelUpload = () => {
    operationRef.current?.cancel();
    operationRef.current = null;
    setPhase("failed");
    setErrorMessage(copy.cancelled);
  };

  const submitUpload = async () => {
    if (!userId) {
      navigate("login");
      return;
    }

    setErrorMessage("");
    setPhase("validating");
    setProgress(null);

    const validation = validateWardrobeImageSelection({
      asset,
      category,
      primaryColour,
      userId
    });

    if (!validation.ok) {
      setPhase("failed");
      setErrorMessage(validation.message);
      return;
    }

    try {
      const consent = await readPrivacyConsent(userId);

      if (!consent) {
        setPhase("failed");
        setErrorMessage(copy.missingConsent);
        return;
      }

      setPhase("draft");

      const operation = startWardrobeImageUpload({
        asset,
        category,
        consent,
        name: `${primaryColour.trim()} ${category}`.trim(),
        notes,
        onProgress(uploadProgress) {
          setProgress(uploadProgress);
          setPhase("uploading");
        },
        primaryColour,
        userId
      });

      operationRef.current = operation;
      const result = await operation.promise;

      operationRef.current = null;
      setUploadedItemId(result.itemId);
      setPhase("processing");
    } catch (error) {
      operationRef.current = null;
      setPhase("failed");
      setErrorMessage(error instanceof Error ? error.message : copy.genericError);
    }
  };

  if (!userId) {
    return (
      <Screen body={copy.signedOutBody} theme={theme} title={copy.title}>
        <PrimaryButton onPress={() => navigate("login")} theme={theme}>
          {copy.signInAction}
        </PrimaryButton>
      </Screen>
    );
  }

  if (setupStatus !== "completed") {
    return (
      <Screen body={copy.setupRequiredBody} theme={theme} title={copy.title}>
        <NoticeBox body={copy.setupRequiredNoticeBody} theme={theme} title={copy.setupRequiredNoticeTitle} />
        <PrimaryButton onPress={() => navigate("wardrobeSetupIntro")} theme={theme}>
          {copy.setupAction}
        </PrimaryButton>
        <PrimaryButton onPress={() => navigate("wardrobe")} theme={theme}>
          {copy.backToWardrobeAction}
        </PrimaryButton>
      </Screen>
    );
  }

  return (
    <Screen body={copy.body} theme={theme} title={copy.title}>
      <NoticeBox body={copy.privacyBody} theme={theme} title={copy.privacyTitle} />
      <WardrobeImagePickerSection
        asset={asset}
        copy={copy.imagePicker}
        disabled={isBusy}
        onAssetSelected={(selectedAsset) => {
          setAsset(selectedAsset);
          setErrorMessage("");
          setPhase("idle");
        }}
        onError={(message) => {
          setPhase("failed");
          setErrorMessage(message);
        }}
        theme={theme}
      />
      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>{copy.categoryTitle}</Text>
        <View style={styles.chipGroup}>
          {WARDROBE_CATEGORIES.map((candidateCategory) => (
            <OptionChip
              key={candidateCategory}
              onPress={() => setCategory(candidateCategory)}
              selected={category === candidateCategory}
              theme={theme}
            >
              {copy.categoryLabels[candidateCategory]}
            </OptionChip>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={[styles.heading, { color: theme.text }]}>{copy.colourTitle}</Text>
        <View style={styles.swatchGroup}>
          {colourOptions.map((colour) => {
            const selected = primaryColour === colour.value;

            return (
              <Pressable
                accessibilityLabel={colour.label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={colour.value}
                onPress={() => setPrimaryColour(colour.value)}
                style={[
                  styles.swatchButton,
                  {
                    borderColor: selected ? theme.accent : theme.border,
                    backgroundColor: theme.surfaceMuted
                  }
                ]}
              >
                <View style={[styles.swatch, { backgroundColor: colour.swatch, borderColor: theme.border }]} />
                <Text style={[styles.swatchLabel, { color: theme.text }]}>{colour.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          accessibilityLabel={copy.customColourLabel}
          onChangeText={setPrimaryColour}
          placeholder={copy.customColourLabel}
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          value={primaryColour}
        />
      </View>
      <TextInput
        accessibilityLabel={copy.notesLabel}
        maxLength={500}
        multiline
        onChangeText={setNotes}
        placeholder={copy.notesLabel}
        placeholderTextColor={theme.textMuted}
        style={[styles.notesInput, { borderColor: theme.border, color: theme.text }]}
        value={notes}
      />
      <NoticeBox body={copy.analysisBody} theme={theme} title={copy.analysisTitle} />
      <WardrobeUploadProgress phase={phase} progress={progress} theme={theme} />
      <WardrobeUploadError message={errorMessage} theme={theme} title={copy.errorTitle} />
      {phase === "uploaded" || phase === "saved_processing" ? (
        <PrimaryButton onPress={() => navigate("wardrobe")} theme={theme}>
          {copy.doneAction}
        </PrimaryButton>
      ) : null}
      {phase === "failed" ? (
        <PrimaryButton disabled={isBusy} onPress={resetForRetry} theme={theme}>
          {copy.retryAction}
        </PrimaryButton>
      ) : null}
      {isBusy ? (
        <PrimaryButton onPress={cancelUpload} theme={theme}>
          {copy.cancelAction}
        </PrimaryButton>
      ) : phase === "idle" ? (
        <PrimaryButton disabled={isBusy} onPress={submitUpload} theme={theme}>
          {copy.uploadAction}
        </PrimaryButton>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  heading: {
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14
  },
  notesInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 96,
    paddingHorizontal: 14,
    paddingTop: 12,
    textAlignVertical: "top"
  },
  section: {
    gap: 10
  },
  swatch: {
    borderRadius: 999,
    borderWidth: 1,
    height: 20,
    width: 20
  },
  swatchButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 10,
    paddingVertical: 9
  },
  swatchGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  swatchLabel: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  }
});
