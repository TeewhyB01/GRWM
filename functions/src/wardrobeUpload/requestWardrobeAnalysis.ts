import {
  canClientRequestWardrobeAnalysis,
  type ConsentGateInput,
  type WardrobeAnalysisRequestPayload,
  type WardrobeAnalysisStatus
} from "@grwm/shared";

export interface WardrobeAnalysisRequestDecision {
  aiJobCreated: false;
  analysisStatus: WardrobeAnalysisStatus;
  failureReason: "blocked_missing_consent" | "analysis_not_implemented" | "";
  ok: boolean;
}

export function evaluateWardrobeAnalysisRequest(params: {
  consent: ConsentGateInput;
  payload: WardrobeAnalysisRequestPayload;
}): WardrobeAnalysisRequestDecision {
  if (!canClientRequestWardrobeAnalysis(params)) {
    return {
      ok: false,
      analysisStatus: "blocked_missing_consent",
      failureReason: "blocked_missing_consent",
      aiJobCreated: false
    };
  }

  return {
    ok: true,
    analysisStatus: "pending",
    failureReason: "analysis_not_implemented",
    aiJobCreated: false
  };
}
