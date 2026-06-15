import { StyleSheet, Text, View } from "react-native";

import type { ThemeTokens } from "../theme";
import type { WardrobeUploadPhase, WardrobeUploadProgressSnapshot } from "./wardrobeUploadTypes.ts";

interface WardrobeUploadProgressProps {
  phase: WardrobeUploadPhase;
  progress: WardrobeUploadProgressSnapshot | null;
  theme: ThemeTokens;
}

const phaseLabels: Record<WardrobeUploadPhase, string> = {
  idle: "Ready",
  validating: "Checking image",
  draft: "Saving private draft",
  uploading: "Uploading privately",
  processing: "Processing upload",
  saved_processing: "Upload saved, still processing",
  uploaded: "Upload complete",
  failed: "Upload needs attention"
};

export function WardrobeUploadProgress({ phase, progress, theme }: WardrobeUploadProgressProps) {
  const percent = phase === "uploaded" ? 100 : progress?.percent ?? 0;

  return (
    <View
      accessibilityLabel={phaseLabels[phase]}
      style={[styles.container, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.text }]}>{phaseLabels[phase]}</Text>
        <Text style={[styles.percent, { color: theme.textMuted }]}>{percent}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <View style={[styles.fill, { backgroundColor: theme.accent, width: `${percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 12
  },
  fill: {
    borderRadius: 999,
    height: "100%"
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20
  },
  percent: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  },
  track: {
    borderRadius: 999,
    height: 8,
    overflow: "hidden"
  }
});
