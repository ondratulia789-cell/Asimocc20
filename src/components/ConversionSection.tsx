import { Clock, Film, Flame, TrendingUp, Trophy, Share2, Zap, CalendarDays, Gift, Star } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

const mainFeatures = [
  {
    icon: Clock,
    title: 'Celkový čas na TikToku',
    desc: 'Kolik minut, hodin a dní tvého života šlo do scrollování',
    blurred: '47 832 minut',
  },
  {
    icon: Film,
    title: 'Počet zhlédnutých videí',
    desc: 'Přesné číslo videí, které jsi za celou dobu viděl/a',
    blurred: '89 241 videí',
  },
];

const bonusFeatures = [
  { icon: Flame, title: 'Nejdelší session', desc: 'Tvůj rekord – nejdelší doba bez přestávky na TikToku', blurred: '194 minut' },
  { icon: TrendingUp, title: 'Denní průměr', desc: 'Kolik minut denně v průměru TikToku věnuješ', blurred: '62 minut' },
  { icon: CalendarDays, title: 'Počet videí za týden', desc: 'Kolik videí v průměru zhlédneš každý týden', blurred: '847 videí' },
  { icon: Trophy, title: 'Tvoje rekordy', desc: 'Který den a týden jsi zhlédl/a nejvíc videí – s přesným datem', blurred: '312 videí za den' },
  { icon: Share2, title: 'Sdílecí obrázek', desc: 'Vytvoř si obrázek se svými statistikami a pošli ho kamarádům', blurred: 'Vlastní design' },
];

const reviews = [
  { name: 'Tereza M.', text: 'Šílený, 67 dní na TikToku za rok?! Děkuju za otevření očí 😭😢', stars: 5, avatar: 'TM' },
  { name: 'Jakub K.', text: 'Super appka, konečně vím kolik času tím trávím. Doporučuju všem!', stars: 5, avatar: 'JK' },
  { name: 'Aneta V.', text: 'Zhlédla jsem 140 tisíc videí… nejtěžší pravda co jsem viděla.', stars: 5, avatar: 'AV' },
  { name: 'Martin P.', text: 'Jednoduchy, rychly, a fr funguje. za par sekund jsem mel vysledky.', stars: 5, avatar: 'MP' },
  { name: 'Klára S.', text: 'Posílám to všem kamarádkám, ať se taky leknou 😂', stars: 4, avatar: 'KS' },
];

interface ConversionSectionProps {
  onScrollToUpload: () => void;
}

const FeatureRow = ({ f, accent = 'cyan' }: { f: typeof mainFeatures[0]; accent?: 'cyan' | 'pink' }) => {
  const Icon = f.icon;
  const isCyan = accent === 'cyan';
  return (
    <div className={`flex items-center gap-4 rounded-2xl bg-card/40 border px-4 py-3.5 ${isCyan ? 'border-white/8' : 'border-white/8'}`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card/60 border ${isCyan ? 'border-white/12' : 'border-white/12'}`}>
        <Icon className={`h-4 w-4 ${isCyan ? 'text-foreground/90' : 'text-foreground/70'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{f.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
      </div>
      <span className={`text-xs font-display font-bold blur-[5px] select-none shrink-0 ${isCyan ? 'text-cyan-glow' : 'text-pink-glow'}`}>
        {f.blurred}
      </span>
    </div>
  );
};

const ConversionSection = ({ onScrollToUpload }: ConversionSectionProps) => {
  return (
    <section className="mt-16 space-y-14">
      {/* Headline */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <span className="tag-label">Funkce</span>
        </div>
        <h2 className="text-2xl font-display font-semibold text-foreground tracking-tight">
          Co <span className="text-cyan-glow">všechno</span> zjistíš
        </h2>
        <p className="text-sm text-muted-foreground">
          Nahraj data a uvidíš kompletní přehled
        </p>
      </div>

      {/* Main features */}
      <div className="space-y-3">
        {mainFeatures.map((f, i) => (
          <FeatureRow key={f.title} f={f} accent={i % 2 === 0 ? 'pink' : 'cyan'} />
        ))}
      </div>

      {/* Bonus section */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Gift className="h-3.5 w-3.5 text-foreground/90" />
          <p className="text-[11px] font-display font-semibold uppercase tracking-[0.15em] text-brand-gradient">
            + k tomu zdarma
          </p>
        </div>
        <div className="space-y-3">
          {bonusFeatures.map((f, i) => (
            <FeatureRow key={f.title} f={f} accent={i % 2 === 0 ? 'cyan' : 'pink'} />
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <p className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-[0.15em]">
            Recenze
          </p>
          <div className="flex items-center gap-0.5 ml-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-foreground/60 text-foreground/60" />
            ))}
          </div>
        </div>
        <Carousel opts={{ align: 'start', loop: true }} className="w-full">
          <CarouselContent className="-ml-3">
            {reviews.map((r, i) => {
              const isCyan = i % 2 === 0;
              return (
              <CarouselItem key={i} className="pl-3 basis-[85%]">
                <div className={`rounded-2xl border p-4 space-y-3 bg-card/40 ${isCyan ? 'border-white/10' : 'border-white/10'}`}>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-background text-xs font-bold"
                      style={{ background: isCyan ? 'hsl(0 0% 96%)' : 'hsl(0 0% 75%)' }}
                    >
                      {r.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{r.name}</p>
                      <div className="flex gap-0.5">
                        {[...Array(r.stars)].map((_, j) => (
                          <Star key={j} className={`h-3 w-3 ${isCyan ? 'fill-foreground/80 text-foreground/80' : 'fill-foreground/60 text-foreground/60'}`} />
                        ))}
                        {[...Array(5 - r.stars)].map((_, j) => (
                          <Star key={j} className="h-3 w-3 text-muted-foreground/30" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                </div>
              </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Urgency */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-card/60 px-4 py-1.5">
          <Zap className="h-3.5 w-3.5 text-foreground/90" />
          <span className="text-xs font-medium text-foreground/80">Výsledky do 10 sekund</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Stačí nahrát soubor. Žádná registrace, žádné čekání.
        </p>
      </div>

      {/* CTA */}
      <div className="rounded-3xl border border-white/12 bg-card/40 p-5 text-center space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">
          Připraven na svou <span className="text-cyan-glow">realitu</span>?
        </h3>
        <button
          onClick={onScrollToUpload}
          className="btn-brand w-full rounded-2xl py-3.5 font-display font-bold text-sm flex items-center justify-center gap-2"
        >
          ↑ Chci vidět svá čísla
        </button>
        <p className="text-[11px] text-muted-foreground">Zabere to 2 minuty</p>
      </div>
    </section>
  );
};

export default ConversionSection;
