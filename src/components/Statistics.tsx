import { useState } from 'react';
import { Clock, Film, Flame, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatisticsProps {
  totalMinutes: number;
  totalVideos: number;
  longestSession: number;
  averageDaily: number;
  periodStart: string;
  periodEnd: string;
}

type TimeUnit = 'minutes' | 'hours' | 'days';

const formatDateCzech = (isoDate: string): string => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  return date.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const Statistics = ({ totalMinutes, totalVideos, longestSession, averageDaily, periodStart, periodEnd }: StatisticsProps) => {
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('minutes');

  const formatTime = (minutes: number, unit: TimeUnit): string => {
    switch (unit) {
      case 'hours': return (minutes / 60).toFixed(1);
      case 'days': return (minutes / 60 / 24).toFixed(1);
      default: return minutes.toLocaleString();
    }
  };

  const getUnitLabel = (unit: TimeUnit): string => {
    switch (unit) {
      case 'hours': return 'hodin';
      case 'days': return 'dní';
      default: return 'minut';
    }
  };

  const secondaryStats = [
    { icon: Film, label: 'Videí', value: totalVideos.toLocaleString(), color: 'text-foreground/80' },
    { icon: Flame, label: 'Nejdelší session', value: `${longestSession} min`, color: 'text-foreground/65' },
    { icon: TrendingUp, label: 'Denně průměr', value: `${averageDaily.toFixed(0)} min`, color: 'text-foreground' },
  ];

  const periodLabel = periodStart && periodEnd 
    ? `${formatDateCzech(periodStart)} – ${formatDateCzech(periodEnd)}`
    : '';

  return (
    <div className="space-y-8">
      {/* Hero number */}
      <div className="text-center space-y-5">
        {periodLabel && (
          <p className="text-xs font-display text-muted-foreground uppercase tracking-[0.15em]">
            {periodLabel}
          </p>
        )}

        <div className="relative py-4">
          {/* Glow backdrop */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
          </div>

          <div className="relative space-y-2">
            <span className="block text-7xl sm:text-8xl font-display font-black gradient-text leading-none tracking-tighter text-center mx-auto drop-shadow-[0_0_40px_hsl(265_85%_60%/0.25)]">
              {formatTime(totalMinutes, timeUnit)}
            </span>
            <span className="block text-base text-muted-foreground font-light tracking-wide uppercase">
              {getUnitLabel(timeUnit)} na TikToku
            </span>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex justify-center pt-1">
          <div className="inline-flex rounded-full glass border border-border/30 p-1">
            {(['minutes', 'hours', 'days'] as TimeUnit[]).map((unit) => (
              <button
                key={unit}
                onClick={() => setTimeUnit(unit)}
                className={cn(
                  "px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300",
                  timeUnit === unit
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {unit === 'minutes' ? 'Minuty' : unit === 'hours' ? 'Hodiny' : 'Dny'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-3">
        {secondaryStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-subtle rounded-xl border border-border/20 p-4 text-center space-y-2">
              <Icon className={cn("h-4 w-4 mx-auto", stat.color)} />
              <p className={cn("text-xl sm:text-2xl font-display font-bold", stat.color)}>
                {stat.value}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Statistics;
