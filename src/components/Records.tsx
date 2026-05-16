import { Flame, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecordsProps {
  recordDay: { date: string; count: number };
  recordDayMinutes: { date: string; minutes: number };
  recordWeek: { weekStart: string; weekEnd: string; count: number };
}

const formatDateCzech = (isoDate: string): string => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatMinutesToHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
};

const Records = ({ recordDay, recordDayMinutes }: RecordsProps) => {
  const items = [
    {
      icon: Calendar,
      value: recordDay.count.toLocaleString(),
      label: 'videí za jediný den',
      detail: formatDateCzech(recordDay.date),
    },
    {
      icon: Clock,
      value: formatMinutesToHours(recordDayMinutes.minutes),
      label: 'scrollování za den',
      detail: formatDateCzech(recordDayMinutes.date),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        <span className="tag-label">Rekordy</span>
      </div>
      <h3 className="text-center text-xl font-display font-semibold text-foreground tracking-tight">
        Tvoje osobní maxima
      </h3>

      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-2">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="relative rounded-2xl border border-border/60 bg-card/40 p-6 text-center overflow-hidden"
            >
              <div className="relative space-y-3">
                <Icon className="h-4 w-4 mx-auto text-foreground/60" />
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-3xl font-display font-black text-foreground whitespace-nowrap">
                    {item.value}
                  </span>
                  <Flame className="h-4 w-4 text-foreground/50" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                <p className="text-[10px] text-muted-foreground/60">{item.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Records;
