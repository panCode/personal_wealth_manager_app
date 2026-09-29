"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

/** Rehydrates the persisted store once on the client, after first paint, so server and client markup match. */
export function StoreHydrator() {
  useEffect(() => {
    useStore.persist.rehydrate();
    useStore.getState().setHydrated();
  }, []);
  return null;
}
