import { useEffect, useState, useMemo } from "react";

const FIRST_NAMES = [
  "kubas", "anet", "mar", "terez", "ada", "lucka", "dav", "sarah",
  "honza", "pet", "tom", "nikky", "fil", "barun", "maty", "ell",
  "simon", "kar", "vojta", "zuza", "dany", "mon", "jakub", "veru",
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function genNick() {
  return FIRST_NAMES[rand(0, FIRST_NAMES.length - 1)] + "_***";
}

type Notification = { id: number; icon: string; text: string };

function generateNotifications(seed: number): Notification[] {
  const list: Notification[] = [];
  let id = seed * 1000;

  for (let i = 0; i < 24; i++) {
    const type = i % 4;
    if (type === 0) {
      list.push({ id: id++, icon: "✨", text: `${genNick()} právě zjistil${Math.random() > 0.5 ? "a" : ""} svoje stats` });
    } else if (type === 1) {
      list.push({ id: id++, icon: "🔥", text: `Rekord dne: ${rand(3, 7)}h ${rand(5, 59)}m čistého času` });
    } else if (type === 2) {
      list.push({ id: id++, icon: "👀", text: `${rand(8, 42)} lidí právě analyzuje svoje data` });
    } else {
      list.push({ id: id++, icon: "😳", text: `Někdo právě zjistil že scrolloval ${rand(800, 2400)} hodin` });
    }
  }
  return list;
}

const DISPLAY_MS = 4200;
const FADE_MS = 600;

const LiveTicker = () => {
  const [generation, setGeneration] = useState(0);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const notifications = useMemo(() => generateNotifications(generation), [generation]);

  useEffect(() => {
    const refresh = setInterval(() => setGeneration((g) => g + 1), 5 * 60 * 1000);
    return () => clearInterval(refresh);
  }, []);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % notifications.length);
        setVisible(true);
      }, FADE_MS);
    }, DISPLAY_MS + FADE_MS);
    return () => clearInterval(cycle);
  }, [notifications.length]);

  const current = notifications[index];
  if (!current) return null;

  return (
    <div className="pointer-events-none fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,400px)] flex justify-center">
      <div
        key={current.id}
        className={`pointer-events-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-full
          bg-background/40 backdrop-blur-xl border border-white/10
          shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),0_0_24px_-6px_rgba(255,255,255,0.25)]
          transition-all duration-[600ms] ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-foreground/80 opacity-60 animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foreground/80" />
        </span>
        <span className="text-[11px] leading-tight text-foreground/85 font-medium tracking-tight truncate">
          <span className="mr-1">{current.icon}</span>
          {current.text}
        </span>
      </div>
    </div>
  );
};

export default LiveTicker;
