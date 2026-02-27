"use client";

import { createContext, useContext } from "react";
import type { DiscoverySession } from "./discovery-types";

export type SessionAction =
  | { type: "SET_STEP"; step: number }
  | { type: "UPDATE_SNAPSHOT"; data: Partial<DiscoverySession["businessSnapshot"]> }
  | { type: "SET_PAIN_POINTS"; painPoints: DiscoverySession["painPoints"] }
  | { type: "SET_VALUE_MAP"; valueMap: DiscoverySession["valueMap"] }
  | { type: "SET_OPPORTUNITIES"; opportunities: DiscoverySession["automationOpportunities"] }
  | { type: "UPDATE_AGREEMENT"; data: Partial<DiscoverySession["agreement"]> }
  | { type: "LOAD_SESSION"; session: DiscoverySession };

export function sessionReducer(
  state: DiscoverySession,
  action: SessionAction
): DiscoverySession {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };
    case "UPDATE_SNAPSHOT":
      return {
        ...state,
        businessSnapshot: { ...state.businessSnapshot, ...action.data },
      };
    case "SET_PAIN_POINTS":
      return { ...state, painPoints: action.painPoints };
    case "SET_VALUE_MAP":
      return { ...state, valueMap: action.valueMap };
    case "SET_OPPORTUNITIES":
      return { ...state, automationOpportunities: action.opportunities };
    case "UPDATE_AGREEMENT":
      return {
        ...state,
        agreement: { ...state.agreement, ...action.data },
      };
    case "LOAD_SESSION":
      return action.session;
    default:
      return state;
  }
}

export const SessionContext = createContext<{
  session: DiscoverySession;
  dispatch: React.Dispatch<SessionAction>;
} | null>(null);

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
