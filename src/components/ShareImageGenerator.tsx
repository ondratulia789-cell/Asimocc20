
import { useState, useRef } from "react";
import { Download, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareImageGeneratorProps {
  totalMinutes: number;
  totalVideos: number;
  longestSession: number;
  averageDaily: number;
}

const formatNumber = (n: number) =>
  new Intl.NumberFormat("en-US").format(n);

/**
 * Slider 0–100
 * 0–10  : tmavá šedá
 * 10–100: plynulá tmavá duha
 */
const getViaColor = (v: number) => {
  if (v <= 10) {
    const l = 14 + v * 0.3; // ~14 → 17 %
    return `hsl(0, 0%, ${l}%)`;
  }

  const t = (v - 10) / 90;
  const hue = t * 360;
  const lightness = 18 + t * 4;

  return `hsl(${hue}, 60%, ${lightness}%)`;
};

const ShareImageGenerator = ({
  totalMinutes,
  totalVideos,
  longestSession,
  averageDaily,
}: ShareImageGeneratorProps) => {
  const [slider, setSlider] = useState(6); // výchozí tmavá šedá
  const cardRef = useRef<HTMLDivElement>(null);

  const viaColor = getViaColor(slider);

  const backgroundStyle = {
    background: `linear-gradient(135deg, #000000, ${viaColor}, #000000)`,
  };

  const days = (totalMinutes / 60 / 24).toFixed(1);
  const textShadowStyle = {
    textShadow: "0 1px 2px rgba(0,0,0,0.45)",
  };

  // 📸 EXPORT
  const handleShare = async () => {
    if (!cardRef.current) return;

    const clone = cardRef.current.cloneNode(true) as HTMLDivElement;
    clone.style.position = "fixed";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.width = "360px";
    clone.style.height = "360px";
    clone.style.transform = "none";
    document.body.appendChild(clone);

    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(clone, {
      width: 360,
      height: 360,
      scale: 1080 / 360,
      useCORS: true,
      backgroundColor: null,
    });

    document.body.removeChild(clone);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) return;

    const file = new File([blob], "asimoc-tiktok-stats.png", { type: "image/png" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ title: "Moje TikTok statistiky", files: [file] });
        return;
      } catch {}
    }

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "asimoc-tiktok-stats.png";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="space-y-5">
        <div className="flex justify-center">
          <span className="tag-label">Sdílení</span>
        </div>
        <h3 className="text-center text-xl font-display font-semibold text-foreground tracking-tight flex items-center justify-center gap-2">
          <Share2 className="h-4 w-4 text-foreground/70" />
          Sdílecí obrázek
        </h3>

        {/* SLIDER */}
        <div className="px-2">
          <input
            type="range"
            min={0}
            max={100}
            value={slider}
            onChange={(e) => setSlider(Number(e.target.value))}
            className="slider w-full"
            style={{
              background:
                "linear-gradient(to right,\
                hsl(0,0%,14%),\
                hsl(0,0%,14%),\
                hsl(40,60%,18%),\
                hsl(80,60%,18%),\
                hsl(120,60%,18%),\
                hsl(160,60%,18%),\
                hsl(200,60%,18%),\
                hsl(240,60%,18%),\
                hsl(280,60%,18%),\
                hsl(320,60%,18%),\
                hsl(360,60%,18%))",
            }}
          />
        </div>
      </div>

      {/* CARD */}
      <div
        ref={cardRef}
        style={backgroundStyle}
        className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-2xl p-8"
      >
        <div className="relative z-10 h-full flex flex-col text-center">
          {/* TOP */}
          <div>
            <h2 className="text-2xl font-bold text-[#ededed]" style={textShadowStyle}>
              Asi Moc
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              TikTok statistiky 
            </p>
            <p className="text-[11px] sm:text-sm text-muted-foreground/60 mt-3">
              Za celou dobu 
            </p>
          </div>

          {/* MAIN */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <p
              data-minutes-number
              className="text-6xl sm:text-7xl font-bold text-white leading-none"
              style={textShadowStyle}
            >
              {formatNumber(totalMinutes)}
            </p>
            <p className="text-muted-foreground mt-2 text-lg sm:text-xl" style={textShadowStyle}>
              minut na TikToku
            </p>
            <p className="text-muted-foreground/60 text-sm sm:text-base">
              ({days} dní)
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white" style={textShadowStyle}>
                {formatNumber(totalVideos)}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">videí</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white" style={textShadowStyle}>
                {Math.round(longestSession)} <span className="text-sm font-normal">min</span>
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">session</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white" style={textShadowStyle}>
                {averageDaily.toFixed(0)} <span className="text-sm font-normal">min</span>
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">denně</p>
            </div>
          </div>

          {/* WATERMARK */}
          <div className="pt-4 mt-4 border-t border-border/20 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground/60">asimoc.site</p>
          </div>
        </div>
      </div>

      {/* SHARE */}
      <button
        onClick={handleShare}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-medium bg-primary text-primary-foreground hover:opacity-90 transition"
      >
        <Download className="h-5 w-5" />
        Sdílet / uložit obrázek
      </button>

      {/* SLIDER CSS */}
      <style>{`
        .slider {
          -webkit-appearance: none;
          height: 14px;
          border-radius: 999px;
          cursor: pointer;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background: white;
          border: 2px solid #000;
        }
        .slider::-moz-range-thumb {
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background: white;
          border: 2px solid #000;
        }
      `}</style>
    </div>
  );
};

export default ShareImageGenerator;

