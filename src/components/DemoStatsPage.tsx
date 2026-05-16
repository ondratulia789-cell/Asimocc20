import { Upload, AlertTriangle, Film, Flame, TrendingUp, Calendar, CalendarDays, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoStatsPageProps {
  onBack: () => void;
}

const blur = "blur-[6px] select-none pointer-events-none";

const DemoStatsPage = ({ onBack }: DemoStatsPageProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 py-14">
        {/* Header */}
        <header className="text-center mb-8 space-y-3">
          <h1 className="text-5xl sm:text-6xl font-display font-black gradient-text leading-tight">
            Asimoc
          </h1>
          <p className="text-base text-foreground/80">
            Zjisti, kolik času ti vzal{" "}
            <span className="text-foreground font-semibold">TikTok</span>
          </p>
        </header>

        {/* Critical demo warning — only place red is allowed */}
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 mb-10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1 space-y-2">
              <p className="font-display font-semibold text-foreground text-sm">
                Toto nejsou tvá data
              </p>
              <p className="text-xs text-muted-foreground">
                Pouze ukázka, jak budou statistiky vypadat. Nahraj svůj export a uvidíš skutečná čísla.
              </p>
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition mt-1"
              >
                <Upload className="h-3.5 w-3.5" />
                Nahrát svá data
              </button>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="space-y-10">
          {/* Hero number */}
          <div className="text-center space-y-4">
            <p className="text-xs font-display text-muted-foreground uppercase tracking-[0.15em]">
              Za celé období používání
            </p>
            <div className="space-y-1">
              <span className={cn("block text-7xl sm:text-8xl font-display font-black gradient-text leading-none tracking-tight", blur)}>
                99 999
              </span>
              <span className="block text-base text-muted-foreground font-light tracking-wide uppercase">
                minut na TikToku
              </span>
            </div>
            <div className="flex justify-center pt-2">
              <div className="inline-flex rounded-full border border-border bg-card/60 p-1">
                {['Minuty', 'Hodiny', 'Dny'].map((unit, idx) => (
                  <button
                    key={unit}
                    disabled
                    className={cn(
                      "px-4 py-1.5 text-xs font-medium rounded-full",
                      idx === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Film, label: 'Videí', value: '89 241' },
              { icon: Flame, label: 'Nejdelší session', value: '194 min' },
              { icon: TrendingUp, label: 'Denně průměr', value: '62 min' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="rounded-xl border border-border/60 bg-card/40 p-4 text-center space-y-2">
                  <Icon className="h-4 w-4 mx-auto text-foreground/60" />
                  <p className={cn("text-xl sm:text-2xl font-display font-bold text-foreground", blur)}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <div className="section-divider" />

          {/* Records */}
          <div className="space-y-5">
            <div className="flex justify-center">
              <span className="tag-label">Rekordy</span>
            </div>
            <h3 className="text-center text-xl font-display font-semibold text-foreground tracking-tight">
              Tvoje osobní maxima
            </h3>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { icon: Calendar, value: '312', label: 'videí za den', detail: '14. srpna 2025' },
                { icon: CalendarDays, value: '1 847', label: 'videí za týden', detail: '11.8. – 17.8.' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="relative rounded-2xl border border-border/60 bg-card/40 p-5 text-center overflow-hidden">
                    <div className="relative space-y-2">
                      <Icon className="h-4 w-4 mx-auto text-foreground/60" />
                      <div className="flex items-center justify-center gap-1">
                        <span className={cn("text-3xl font-display font-black text-foreground", blur)}>
                          {item.value}
                        </span>
                        <Flame className="h-4 w-4 text-foreground/50" />
                      </div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className={cn("text-[10px] text-muted-foreground/70", blur)}>{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="section-divider" />

          {/* Share image preview */}
          <div className="space-y-5">
            <div className="flex justify-center">
              <span className="tag-label">Sdílení</span>
            </div>
            <h3 className="text-center text-xl font-display font-semibold text-foreground tracking-tight">
              Sdílecí obrázek
            </h3>

            <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-card via-background to-card border border-border/60">
              <div className="h-full flex flex-col text-center">
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground/90">Asi Moc</h2>
                  <p className="text-xs text-muted-foreground mt-1">TikTok statistiky</p>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <p className={cn("text-6xl font-display font-bold text-foreground leading-none", blur)}>
                    99 999
                  </p>
                  <p className="text-muted-foreground mt-2 text-lg">minut na TikToku</p>
                  <p className={cn("text-muted-foreground/60 text-sm", blur)}>(69.4 dní)</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {['89 241', '194', '62'].map((val, i) => (
                    <div key={i}>
                      <p className={cn("text-xl font-display font-bold text-foreground", blur)}>{val}</p>
                      <p className="text-xs text-muted-foreground">{['videí', 'session', 'denně'][i]}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-4 mt-4 border-t border-border/30">
                  <p className="text-xs text-muted-foreground/60">asimoc.site</p>
                </div>
              </div>
            </div>

            <button
              disabled
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-medium border border-border bg-card/60 text-muted-foreground cursor-not-allowed"
            >
              <Download className="h-5 w-5" />
              Sdílet / uložit obrázek
            </button>
          </div>
        </div>

        {/* Back CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-display font-bold text-primary-foreground hover:opacity-90 transition"
          >
            <Upload className="h-4 w-4" />
            Nahrát svá TikTok data
          </button>
          <p className="text-xs text-muted-foreground mt-3">
            Uvidíš svá skutečná čísla místo rozmazaných
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoStatsPage;
