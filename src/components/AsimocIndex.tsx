import { useEffect, useState, useRef } from "react";
import FileUpload from "@/components/FileUpload";
import Instructions from "@/components/Instructions";
import Statistics from "@/components/Statistics";
import Records from "@/components/Records";
import ShareImageGenerator from "@/components/ShareImageGenerator";
import LockedStats from "@/components/LockedStats";
import DemoStatsPage from "@/components/DemoStatsPage";
import ConversionSection from "@/components/ConversionSection";
import ExtremeMetrics from "@/components/ExtremeMetrics";
import PremiumStoryCard from "@/components/PremiumStoryCard";
import PricingTiers from "@/components/PricingTiers";
import {
  parseJsonFile,
  parseZipFile,
  parseTxtFile,
  calculateStats,
  TikTokStats,
} from "@/lib/tiktokParser";
import { toast } from "@/hooks/use-toast";
import { usePaywall } from "@/hooks/usePaywall";
import { Eye, Shield, Crown, Flame, Download, FileJson, Sparkles, Zap, Smile } from "lucide-react";

const STATS_KEY = "asimoc_stats";

const previewSlides = [
  {
    title: "Lehký scroller",
    videos: "38 214",
    total: "214h",
    daily: "35m",
    session: "1h 08m",
    top: "42 %",
    spark: "M0 32 Q 25 30, 50 31 T 100 28 T 150 30 T 200 26",
  },
  {
    title: "Průměrný uživatel",
    videos: "96 480",
    total: "512h",
    daily: "1h 24m",
    session: "2h 47m",
    top: "18 %",
    spark: "M0 30 Q 25 26, 50 28 T 100 22 T 150 24 T 200 18",
  },
  {
    title: "Náročný scroller",
    videos: "178 902",
    total: "986h",
    daily: "2h 41m",
    session: "4h 33m",
    top: "3 %",
    spark: "M0 32 Q 25 22, 50 26 T 100 16 T 150 20 T 200 10",
  },
  {
    title: "Závislák",
    videos: "247 391",
    total: "1 384h",
    daily: "3h 24m",
    session: "6h 12m",
    top: "0.1 %",
    spark: "M0 30 Q 25 18, 50 22 T 100 14 T 150 18 T 200 8",
  },
];

const AsimocIndex = () => {
  const [stats, setStats] = useState<TikTokStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const uploadRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleSlideScroll = () => {
    const el = sliderRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveSlide(Math.min(Math.max(index, 0), previewSlides.length - 1));
  };

  const goToSlide = (i: number) => {
    const el = sliderRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const [zobrazitFomo, setZobrazitFomo] = useState(false);
  const [zbyvajiciCas, setZbyvajiciCas] = useState(300);

  const { tier, isStandard, isPremium } = usePaywall();

  useEffect(() => {
    const ulozene = sessionStorage.getItem(STATS_KEY);
    if (ulozene) setStats(JSON.parse(ulozene));
  }, []);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stats, showDemo]);

  useEffect(() => {
    if (!zobrazitFomo) return;
    const interval = setInterval(() => {
      setZbyvajiciCas((cas) => {
        if (cas <= 1) { clearInterval(interval); return 0; }
        return cas - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [zobrazitFomo]);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      let data: any;
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();
      
      const isZip = fileName.endsWith(".zip") || fileType === "application/zip" || fileType === "application/x-zip-compressed";
      const isJson = fileName.endsWith(".json") || fileType === "application/json";
      const isTxt = fileName.endsWith(".txt") || fileType === "text/plain" || fileType.startsWith("text/");
      
      if (isZip) {
        data = await parseZipFile(file);
      } else if (isJson) {
        data = await parseJsonFile(file);
      } else if (isTxt) {
        data = await parseTxtFile(file);
      } else {
        // Last resort: try to read as text
        try {
          data = await parseTxtFile(file);
        } catch {
          toast({ title: "Nepodporovaný formát", description: "Nahraj soubor ve formátu .json, .zip nebo .txt z exportu TikTok dat.", variant: "destructive" });
          return;
        }
      }
      
      if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        toast({ title: "Prázdný soubor", description: "Soubor neobsahuje žádná data. Zkontroluj, že nahráváš správný export z TikToku.", variant: "destructive" });
        return;
      }
      
      const vypocteneStaty = calculateStats(data);
      if (vypocteneStaty.totalVideos === 0) {
        toast({ title: "Žádná historie sledování", description: "V tomto souboru jsme nenašli historii sledování videí. Ujisti se, že nahráváš soubor přímo z exportu TikTok dat (Nastavení → Stáhnout data).", variant: "destructive" });
        return;
      }
      setStats(vypocteneStaty);
      sessionStorage.setItem(STATS_KEY, JSON.stringify(vypocteneStaty));
      setZobrazitFomo(true);
      toast({ title: "Data nahrána ✓", description: "Tvoje statistiky jsou připravené.", duration: 2000 });
    } catch (e) {
      console.error('[Asimoc] Upload error:', e);
      toast({ title: "Nepodařilo se zpracovat soubor", description: "Zkus nahrát soubor znovu. Pokud problém přetrvává, zkus jiný formát (.txt, .json nebo .zip).", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    sessionStorage.clear();
    setStats(null);
    setShowDemo(false);
    setZobrazitFomo(false);
    setZbyvajiciCas(300);
  };

  if (showDemo && !stats) {
    return <DemoStatsPage onBack={() => setShowDemo(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 py-14">
        {/* Header */}
        <header className="text-center mb-8 space-y-5 animate-fade-up">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-card/60 px-3 py-1.5 text-[11px] font-display font-semibold text-foreground/90">
              <Flame className="h-3.5 w-3.5 text-foreground/70" />
              <span className="text-brand-gradient">Zjisti pravdu</span>
            </span>
          </div>
          <h1 className="text-[2.6rem] sm:text-5xl font-display font-black leading-[1.05] tracking-tight text-foreground">
            Kolik času jsi <span className="text-pink-glow">reálně</span> strávil na <span className="text-cyan-glow">TikToku</span>?
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Nahraj svoje TikTok data a zjisti reálné statistiky.
          </p>
        </header>

        {!stats ? (
          <>
            {/* Upload */}
            <div ref={uploadRef}>
              <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
            </div>

            {/* Privacy badge - below upload */}
            <div className="flex justify-center mt-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/60 border border-border/50">
                <Shield className="h-3 w-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground leading-none">
                  Bezpečné. Soukromé. Jen tvoje data.
                </span>
              </div>
            </div>

            {/* Stats Preview — inside abstract phone frame */}
            <div className="relative mt-12 animate-fade-up">
              {/* Background glow blob */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.16), transparent 70%)',
                  filter: 'blur(60px)',
                }}
              />
              <div
                className="relative mx-auto w-full"
                style={{
                  maxWidth: '380px',
                  borderRadius: '40px',
                  padding: '16px',
                  background: 'linear-gradient(150deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.14), 0 40px 100px -40px rgba(0,0,0,0.95), 0 0 80px rgba(255,255,255,0.05)',
                }}
              >
                <div className="relative">
                  <div className="card-neon-frame">
                    <div className="inner p-5 space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4 text-foreground/60" />
                        <span className="font-display font-semibold text-foreground text-sm">
                          {previewSlides[activeSlide].title}
                        </span>
                      </div>

                      {/* Swipeable slideshow */}
                      <div
                        ref={sliderRef}
                        onScroll={handleSlideScroll}
                        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {previewSlides.map((slide) => (
                          <div key={slide.title} className="w-full shrink-0 snap-center px-1 space-y-4">
                            <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
                              <p className="text-xs text-muted-foreground">Zhlédnutých videí</p>
                              <p className="text-4xl font-display font-black text-foreground tracking-tight mt-1">{slide.videos}</p>
                              <svg viewBox="0 0 200 40" className="w-full h-10 mt-2">
                                <path d={slide.spark} stroke="hsl(0 0% 92%)" strokeWidth="2" fill="none" />
                              </svg>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-2xl border border-border/60 bg-card/60 p-3">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Celkový čas</p>
                                <p className="text-xl font-display font-bold text-cyan-glow mt-1">{slide.total}</p>
                              </div>
                              <div className="rounded-2xl border border-border/60 bg-card/60 p-3">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Průměrně denně</p>
                                <p className="text-xl font-display font-bold text-pink-glow mt-1">{slide.daily}</p>
                              </div>
                              <div className="rounded-2xl border border-border/60 bg-card/60 p-3">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Nejdelší session</p>
                                <p className="text-xl font-display font-bold mt-1" style={{color:'hsl(0 0% 60%)'}}>{slide.session}</p>
                              </div>
                              <div className="rounded-2xl border border-border/60 bg-card/60 p-3">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Top scroller</p>
                                <p className="text-xl font-display font-bold text-cyan-glow mt-1">{slide.top}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Dots */}
                      <div className="flex justify-center gap-1.5 pt-1">
                        {previewSlides.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => goToSlide(i)}
                            aria-label={`Slide ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              i === activeSlide ? 'w-5 bg-foreground' : 'w-1.5 bg-foreground/30'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-center text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em]">
                        Náhled — toto nejsou tvoje data
                      </p>
                    </div>
                  </div>
                </div>
                {/* Bottom fade overlay */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-24 rounded-b-[40px]"
                  style={{
                    background: 'linear-gradient(to bottom, transparent 60%, #000 100%)',
                  }}
                />
              </div>
            </div>

            {/* Trust row */}
            <div className="mt-10 grid grid-cols-3 gap-3 text-center">
              {[
                { icon: Shield, color: 'text-foreground/90', title: '100% soukromé', desc: 'Data nikde neukládáme.' },
                { icon: Zap, color: 'text-foreground/70', title: 'Okamžité výsledky', desc: 'Přehled hned.' },
                { icon: Smile, color: 'text-foreground/90', title: 'Otevři oči', desc: 'Čísla, co překvapí.' },
              ].map((t) => (
                <div key={t.title} className="space-y-2">
                  <t.icon className={`h-6 w-6 mx-auto ${t.color}`} strokeWidth={1.5} />
                  <p className="text-xs font-display font-bold text-foreground">{t.title}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug">{t.desc}</p>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="mt-12 space-y-4">
              <p className="text-center text-[10px] text-muted-foreground uppercase tracking-[0.25em] font-display font-semibold">
                Jak to funguje
              </p>
              <div className="space-y-2.5">
                {[
                  { n: '1', icon: Download, label: 'Stáhni TikTok data', color: 'hsl(0 0% 96%)' },
                  { n: '2', icon: FileJson, label: 'Nahraj JSON soubor', color: 'hsl(0 0% 78%)' },
                  { n: '3', icon: Sparkles, label: 'Zjisti svoje stats', color: 'hsl(0 0% 60%)' },
                ].map((s) => (
                  <div key={s.n} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/50 p-3.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-display font-bold text-background" style={{ background: s.color }}>
                      {s.n}
                    </span>
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-display font-medium text-foreground">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social proof */}
            <div className="mt-12 text-center space-y-2">
              <div className="flex justify-center gap-0.5 text-foreground/85 text-base">★★★★★</div>
              <p className="text-sm text-muted-foreground">
                Připojilo se už <span className="text-brand-gradient font-display font-bold">50 000+</span> lidí
              </p>
            </div>

            {/* Demo CTA */}
            <div className="mt-10">
              <button
                onClick={() => setShowDemo(true)}
                className="group w-full relative overflow-hidden rounded-2xl border border-border/60 hover:border-white/25 transition-all duration-300 p-4 bg-card/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted border border-border/60">
                    <Eye className="h-4 w-4 text-foreground/80" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-display font-semibold text-foreground text-sm">
                      Podívej se, jak to vypadá
                    </p>
                    <p className="text-[11px] text-destructive mt-0.5 font-medium">
                      ⚠ Toto nejsou tvá data — pouze demo náhled
                    </p>
                  </div>
                  <span className="text-foreground/60 text-lg group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            </div>

            {/* Final conversion CTA */}
            <div className="mt-12 rounded-3xl border border-white/10 bg-card/40 p-5 text-center space-y-4">
              <h3 className="text-xl font-display font-bold text-foreground">
                Jsi připraven zjistit svou <span className="text-pink-glow">realitu</span>?
              </h3>
              <button
                onClick={scrollToUpload}
                className="btn-brand w-full rounded-2xl py-3.5 font-display font-bold text-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Zjistit moje stats
              </button>
              <p className="text-[11px] text-muted-foreground">Zabere to 2 minuty</p>
            </div>

            <ConversionSection onScrollToUpload={scrollToUpload} />
          </>
        ) : !isStandard ? (
          <>
            {zobrazitFomo && (
              <div className="mb-8 rounded-xl border border-foreground/15 bg-card/60 p-4 text-center space-y-1">
                <p className="text-sm font-display font-semibold text-foreground">
                  Tvoje statistiky jsou připravené ✓
                </p>
                <p className="text-xs text-muted-foreground">
                  Vidíš jen náhled. Odemkni vše níž.
                </p>
              </div>
            )}
            <LockedStats
              averageDaily={stats.averageDaily}
              totalMinutes={stats.totalMinutes}
              totalVideos={stats.totalVideos}
            />
          </>
        ) : (
          <div className="space-y-12">
            {/* Tier badge */}
            <div className="flex justify-center">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-display font-bold uppercase tracking-wider ${
                isPremium
                  ? "bg-foreground text-background"
                  : "border border-border bg-card text-foreground/80"
              }`}>
                {isPremium && <Crown className="h-3 w-3" />}
                {isPremium ? "Premium" : "Standard"} aktivní
              </span>
            </div>

            <Statistics
              totalMinutes={stats.totalMinutes}
              totalVideos={stats.totalVideos}
              longestSession={stats.longestSession}
              averageDaily={stats.averageDaily}
              periodStart={stats.periodStart}
              periodEnd={stats.periodEnd}
            />
            <div className="section-divider" />
            <Records recordDay={stats.recordDay} recordDayMinutes={stats.recordDayMinutes} recordWeek={stats.recordWeek} />
            <div className="section-divider" />

            {/* Last 30 days */}
            <div className="rounded-xl border border-border/60 bg-card/40 p-5 text-center space-y-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-display font-semibold">
                Posledních 30 dní
              </p>
              <div className="flex justify-center items-center gap-10">
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {stats.lastMonthMinutes.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">minut</p>
                </div>
                <div className="h-10 w-px bg-border/60" />
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {stats.lastMonthVideos.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">videí</p>
                </div>
              </div>
            </div>

            <div className="section-divider" />

            {/* Premium-only content */}
            {isPremium ? (
              <>
                <ExtremeMetrics stats={stats} />
                <div className="section-divider" />
                <PremiumStoryCard stats={stats} />
                <div className="section-divider" />
                <ShareImageGenerator
                  totalMinutes={stats.totalMinutes}
                  totalVideos={stats.totalVideos}
                  longestSession={stats.longestSession}
                  averageDaily={stats.averageDaily}
                />
              </>
            ) : (
              <>
                <ShareImageGenerator
                  totalMinutes={stats.totalMinutes}
                  totalVideos={stats.totalVideos}
                  longestSession={stats.longestSession}
                  averageDaily={stats.averageDaily}
                />
                <div className="section-divider" />
                {/* Locked Premium teaser */}
                <ExtremeMetrics stats={stats} locked />
                <div className="section-divider" />
                <PricingTiers currentTier="standard" />
              </>
            )}
          </div>
        )}

        {stats && (
          <button onClick={resetAll} className="mt-14 w-full text-xs text-muted-foreground hover:text-foreground transition">
            ← Nahrát jiná data
          </button>
        )}
      </div>
    </div>
  );
};

export default AsimocIndex;
