import { useEffect, useState } from "react";

const TIER_KEY = "asimoc_tier";

export type Tier = "free" | "standard" | "premium";

export const usePaywall = () => {
  const [tier, setTier] = useState<Tier>("free");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paid = params.get("payment");

    if (paid === "success" || paid === "standard") {
      sessionStorage.setItem(TIER_KEY, "standard");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (paid === "premium") {
      sessionStorage.setItem(TIER_KEY, "premium");
      window.history.replaceState({}, "", window.location.pathname);
    }

    const saved = sessionStorage.getItem(TIER_KEY) as Tier | null;
    // Backward compat: starý "asimoc_paid"
    if (!saved && sessionStorage.getItem("asimoc_paid") === "true") {
      sessionStorage.setItem(TIER_KEY, "standard");
      setTier("standard");
      return;
    }
    if (saved === "standard" || saved === "premium") setTier(saved);
  }, []);

  return {
    tier,
    isPaid: tier !== "free",
    isStandard: tier === "standard" || tier === "premium",
    isPremium: tier === "premium",
  };
};
