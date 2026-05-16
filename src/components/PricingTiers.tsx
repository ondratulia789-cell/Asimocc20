import { Check, Sparkles, Lock, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingTiersProps {
  currentTier?: "free" | "standard" | "premium";
  onSelect?: (tier: "standard" | "premium") => void;
}

// Stejný Stripe link prozatím pro oba tiery (bude nahrazeno).
const STRIPE_URL = "https://buy.stripe.com/cNi14ndL1c4mgTNgvlebu00";

const tiers = [
  {
    id: "free" as const,
    name: "Náhled",
    price: "0",
    suffix: "Kč",
    tag: "Hook",
    blurb: "Jen ochutnávka. Uvidíš pár čísel.",
    features: [
      "Celkový čas + počet videí",
      "Ostatní statistiky rozmazané",
    ],
    cta: null,
    accent: false,
  },
  {
    id: "standard" as const,
    name: "Standard",
    price: "79",
    suffix: "Kč",
    tag: "Nejoblíbenější",
    blurb: "Plný dashboard se všemi čísly.",
    features: [
      "Vše z Náhledu",
      "Rekordy, denní průměr, sessions",
      "Posledních 30 dní",
      "Standardní sdílecí karta",
    ],
    cta: { label: "Odemknout Standard", url: `${STRIPE_URL}?utm=standard`, mark: "standard" as const },
    accent: true,
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: "149",
    suffix: "Kč",
    tag: "Plná verze",
    blurb: "Plný dashboard + extrémní metriky + 9:16 share.",
    features: [
      "Vše ze Standard",
      "💸 Kolik peněz jsi protočil/a",
      "🌙 Noční sova score",
      "🏃 Maratony, knihy, Země kolem",
      "🧠 Dopamine rating",
      "📱 Premium 9:16 karta na Stories",
    ],
    cta: { label: "Odemknout Premium", url: `${STRIPE_URL}?utm=premium`, mark: "premium" as const },
    accent: false,
    crown: true,
  },
];

const PricingTiers = ({ currentTier = "free" }: PricingTiersProps) => {
  return (
    <section className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <span className="tag-label">Ceník</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-semibold text-foreground tracking-tight">
          Vyber si svou úroveň pravdy
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Jednorázová platba. Žádné předplatné. Doživotní přístup k tvým datům.
        </p>
      </div>

      <div className="space-y-3">
        {tiers.map((t) => {
          const isCurrent = currentTier === t.id;
          return (
            <div
              key={t.id}
              className={cn(
                "relative rounded-2xl border p-5 transition-all",
                t.accent
                  ? "border-foreground/30 bg-card/60 shadow-[0_0_0_1px_hsl(0_0%_100%/0.06),0_8px_32px_hsl(0_0%_0%/0.5)]"
                  : "border-border/60 bg-card/40",
                isCurrent && "ring-1 ring-foreground/40"
              )}
            >
              {t.accent && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5">
                    <Sparkles className="h-2.5 w-2.5" />
                    {t.tag}
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    {t.crown && <Crown className="h-3.5 w-3.5 text-foreground/70" />}
                    <h3 className="text-lg font-display font-semibold text-foreground">
                      {t.name}
                    </h3>
                    {!t.accent && !t.crown && (
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground border border-border/60 rounded px-1.5 py-px">
                        {t.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.blurb}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-3xl font-display font-black text-foreground">
                    {t.price}
                  </span>
                  <span className="text-xs text-muted-foreground ml-0.5">{t.suffix}</span>
                </div>
              </div>

              <ul className="space-y-1.5 mb-4">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-foreground/80">
                    <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-foreground/60" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {t.cta ? (
                isCurrent ? (
                  <div className="w-full text-center text-xs font-semibold text-foreground/70 border border-border/60 rounded-lg py-2.5">
                    ✓ Aktivní
                  </div>
                ) : (
                  <a
                    href={t.cta.url}
                    className={cn(
                      "w-full inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition",
                      t.accent || t.crown
                        ? "bg-foreground text-background hover:opacity-90"
                        : "border border-border bg-card hover:bg-accent text-foreground"
                    )}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    {t.cta.label}
                  </a>
                )
              ) : (
                <div className="w-full text-center text-[11px] text-muted-foreground py-2">
                  Aktuálně vidíš tuto úroveň
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Bezpečná platba přes Stripe. Funguje karta i Apple/Google Pay.
      </p>
    </section>
  );
};

export default PricingTiers;
