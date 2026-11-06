import { useEffect, useState } from "react";

const TIER_KEY = "asimoc_tier";

export type Tier = "free" | "standard" | "premium";

const RANK: Record<Tier, number> = { free: 0, standard: 1, premium: 2 };

// UPOZORNĚNÍ: Odemčení stále probíhá jen v prohlížeči podle ?payment=… v URL,
// takže ho lze obejít. Skutečná ochrana vyžaduje ověření platby na serveru
// (Stripe Checkout Session + kontrola session_id).

function readStored(): Tier {
  try {
    const v =
      localStorage.getItem(TIER_KEY) ??
      sessionStorage.getItem(TIER_KEY) ??
      (sessionStorage.getItem("asimoc_paid") === "true" ? "standard" : null);
    return v === "standard" || v === "premium" ? v : "free";
  } catch {
    return "free";
  }
}

function store(tier: Tier) {
  try {
    // localStorage = přístup přežije zavření záložky ("doživotní přístup")
    localStorage.setItem(TIER_KEY, tier);
  } catch {
    /* privátní režim apod. */
  }
}

export const usePaywall = () => {
  const [tier, setTier] = useState<Tier>("free");

  useEffect(() => {
    let current = readStored();

    const params = new URLSearchParams(window.location.search);
    const paid = params.get("payment");
    let fromUrl: Tier | null = null;
    if (paid === "success" || paid === "standard") fromUrl = "standard";
    else if (paid === "premium") fromUrl = "premium";

    if (fromUrl) {
      // Nikdy nesnižovat úroveň (např. Premium → Standard).
      if (RANK[fromUrl] > RANK[current]) current = fromUrl;
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (current !== "free") store(current);
    setTier(current);
  }, []);

  return {
    tier,
    isPaid: tier !== "free",
    isStandard: tier === "standard" || tier === "premium",
    isPremium: tier === "premium",
  };
};
