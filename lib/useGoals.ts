"use client";

import { useMemo } from "react";
import { computeGoals } from "./goals";
import { useStore } from "./store";

/** The three sized goals, recomputed whenever an onboarding answer changes. */
export function useGoals() {
  const ob = useStore((s) => s.onboarding);
  return useMemo(() => computeGoals(ob), [ob]);
}
