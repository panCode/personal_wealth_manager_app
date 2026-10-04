"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Everything the user changes lives here, persisted to localStorage.
 * The persona (seed data) is static; this store only holds deltas.
 */

export type DecisionStatus = "proposed" | "approved" | "declined" | "placed" | "settled";

export type DecisionRecord = {
  status: DecisionStatus;
  at: string; // ISO timestamp of the last change
  note?: string; // optional reason on decline
};

export type AppEvent = { t: string; name: string; props?: Record<string, string | number | boolean> };

export type ExtraSpend = { id: string; amount: number; what: string; source: "cash" | "other-account"; recurring: boolean; at: string };

export type ConnectionKey = "mf" | "bank" | "loan" | "epf" | "stocks" | "insurance";

export type Channel = "app" | "whatsapp" | "both";
export type WatchKey = "decisions" | "money" | "markets" | "funds" | "deadlines" | "news";
export const defaultChannels: Record<WatchKey, Channel> = { decisions: "both", money: "app", markets: "whatsapp", funds: "app", deadlines: "both", news: "app" };

export type Onboarding = {
  connections: Record<ConnectionKey, boolean>;
  household: { spouse: "earns" | "not-earning" | "none"; children: number; parents: number; incomeSteady: "steady" | "variable" | "uncertain" };
  income: number; // monthly take-home
  expenses: { emi: number; household: number; rest: number }; // monthly
  goalsPicked: string[];
  home: { budgetToday: number; year: number; sellFlat: "yes" | "no" | "unsure" };
  retire: { retireAt: number; lifestyle: "simpler" | "same" | "more" };
  risk: "sell" | "hold" | "buy";
};

export const defaultOnboarding: Onboarding = {
  connections: { mf: true, bank: true, loan: true, epf: false, stocks: false, insurance: false },
  household: { spouse: "earns", children: 1, parents: 1, incomeSteady: "steady" },
  income: 145_000,
  expenses: { emi: 38_400, household: 28_000, rest: 16_600 },
  goalsPicked: ["emergency", "home", "retire"],
  home: { budgetToday: 10_000_000, year: 2031, sellFlat: "unsure" },
  retire: { retireAt: 60, lifestyle: "same" },
  risk: "hold",
};

type State = {
  hydrated: boolean;
  decisions: Record<string, DecisionRecord>;
  labels: Record<string, string>;
  extraSpends: ExtraSpend[];
  events: AppEvent[];
  feedback: Array<{ at: string; text: string; screen: string }>;
  onboarded: boolean;
  dismissedInstallBanner: boolean;
  onboarding: Onboarding;
  channels: Record<WatchKey, Channel>;
  quietMode: boolean;
};

type Actions = {
  setChannel: (key: WatchKey, ch: Channel) => void;
  setQuietMode: (on: boolean) => void;
  setOnboarding: (patch: Partial<Onboarding>) => void;
  setHydrated: () => void;
  track: (name: string, props?: AppEvent["props"]) => void;
  approve: (id: string) => void;
  decline: (id: string, note?: string) => void;
  place: (id: string) => void;
  /** `at` is the ISO moment it settled; defaults to now. */
  settle: (id: string, at?: string) => void;
  label: (txnId: string, label: string) => void;
  addSpend: (s: Omit<ExtraSpend, "id" | "at">) => void;
  addFeedback: (text: string, screen: string) => void;
  setOnboarded: () => void;
  dismissInstallBanner: () => void;
  reset: () => void;
};

const initial: State = {
  hydrated: false,
  decisions: {},
  labels: {},
  extraSpends: [],
  events: [],
  feedback: [],
  onboarded: false,
  dismissedInstallBanner: false,
  onboarding: defaultOnboarding,
  channels: defaultChannels,
  quietMode: false,
};

const now = () => new Date().toISOString();

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial,
      setHydrated: () => set({ hydrated: true }),
      setOnboarding: (patch) => set((s) => ({ onboarding: { ...s.onboarding, ...patch } })),
      setChannel: (key, ch) => set((s) => ({ channels: { ...s.channels, [key]: ch } })),
      setQuietMode: (on) => set({ quietMode: on }),
      track: (name, props) => set((s) => ({ events: [...s.events.slice(-499), { t: now(), name, props }] })),
      approve: (id) => {
        set((s) => ({ decisions: { ...s.decisions, [id]: { status: "approved", at: now() } } }));
        get().track("decision_approved", { id });
      },
      decline: (id, note) => {
        set((s) => ({ decisions: { ...s.decisions, [id]: { status: "declined", at: now(), note } } }));
        get().track("decision_declined", { id, note: note ?? "" });
      },
      place: (id) => {
        set((s) => ({ decisions: { ...s.decisions, [id]: { status: "placed", at: now() } } }));
        get().track("order_placed", { id });
      },
      settle: (id, at) => set((s) => ({ decisions: { ...s.decisions, [id]: { status: "settled", at: at ?? now() } } })),
      label: (txnId, label) => {
        set((s) => ({ labels: { ...s.labels, [txnId]: label } }));
        get().track("spend_labelled", { txnId, label });
      },
      addSpend: (spend) => {
        set((s) => ({ extraSpends: [...s.extraSpends, { ...spend, id: `x${Date.now()}`, at: now() }] }));
        get().track("spend_added", { amount: spend.amount, source: spend.source });
      },
      addFeedback: (text, screen) => set((s) => ({ feedback: [...s.feedback, { at: now(), text, screen }] })),
      setOnboarded: () => set({ onboarded: true }),
      dismissInstallBanner: () => set({ dismissedInstallBanner: true }),
      reset: () => set({ ...initial, hydrated: true }),
    }),
    {
      name: "cfo-prototype-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        return { ...current, ...p, onboarding: { ...defaultOnboarding, ...(p.onboarding ?? {}) }, channels: { ...defaultChannels, ...(p.channels ?? {}) } };
      },
      partialize: (s) => ({
        decisions: s.decisions,
        labels: s.labels,
        extraSpends: s.extraSpends,
        events: s.events,
        feedback: s.feedback,
        onboarded: s.onboarded,
        dismissedInstallBanner: s.dismissedInstallBanner,
        onboarding: s.onboarding,
        channels: s.channels,
        quietMode: s.quietMode,
      }),
    }
  )
);

/** Status of a decision, defaulting to "proposed" when the user hasn't touched it. */
export function useDecisionStatus(id: string): DecisionStatus {
  return useStore((s) => s.decisions[id]?.status ?? "proposed");
}
