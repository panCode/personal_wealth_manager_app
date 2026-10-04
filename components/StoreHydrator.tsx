"use client";

import { useEffect } from "react";
import { overdueOrders } from "@/lib/home";
import { useStore } from "@/lib/store";

/**
 * Rehydrates the persisted store once on the client, after first paint, so
 * server and client markup match. Then settles any placed order whose settle
 * date has passed: no exchange calls back in the prototype, and a stale
 * "placed" row would otherwise sit on Home for good.
 */
export function StoreHydrator() {
  useEffect(() => {
    useStore.persist.rehydrate();
    const s = useStore.getState();
    for (const o of overdueOrders(s.decisions)) s.settle(o.id, o.settledAt);
    s.setHydrated();
  }, []);
  return null;
}
