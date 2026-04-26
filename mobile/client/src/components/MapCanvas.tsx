import { ParkingSpot, SpotStatus, overallScore } from "@/services/mockData";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";


interface MapCanvasProps {
  spots: ParkingSpot[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

const statusColor: Record<SpotStatus, string> = {
  open: "bg-status-open",
  busy: "bg-status-busy",
  full: "bg-status-full",
};

/**
 * Stylized placeholder map. Replace this component with a Google Maps
 * <GoogleMap> instance — the surrounding UI stays the same.
 */
export const MapCanvas = ({ spots, selectedId, onSelect }: MapCanvasProps) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Faux map background — Seattle-vibed dark cartography */}
      <div className="absolute inset-0 bg-[hsl(215,55%,11%)]">
        {/* Water (Puget Sound) */}
        <div className="absolute -left-10 top-10 w-2/3 h-full rotate-[18deg] bg-[hsl(200,55%,16%)] opacity-80 blur-[2px]" />
        {/* Lake Union */}
        <div className="absolute right-6 top-12 w-32 h-24 rounded-[40%] bg-[hsl(200,55%,16%)] opacity-80" />

        {/* Grid streets */}
        <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(210 15% 35% / 0.35)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Diagonal arterials */}
          <line x1="0" y1="20%" x2="100%" y2="55%" stroke="hsl(210 15% 45% / 0.5)" strokeWidth="2" />
          <line x1="20%" y1="0" x2="60%" y2="100%" stroke="hsl(210 15% 45% / 0.5)" strokeWidth="2" />
        </svg>

        {/* Heat halos */}
        {spots.map((s, i) => (
          <div
            key={`halo-${s.id}`}
            className={cn(
              "absolute rounded-full blur-2xl opacity-40",
              s.status === "open" && "bg-status-open",
              s.status === "busy" && "bg-status-busy",
              s.status === "full" && "bg-status-full"
            )}
            style={{
              width: 140,
              height: 140,
              left: `${15 + (i * 13) % 70}%`,
              top: `${20 + (i * 19) % 55}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      {/* Pins */}
      {spots.map((s, i) => {
        const left = `${15 + (i * 13) % 70}%`;
        const top = `${20 + (i * 19) % 55}%`;
        const active = s.id === selectedId;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left, top }}
          >
            <span className="relative flex flex-col items-center">
              {/* Star rating chip above the pin */}
              <span
                className={cn(
                  "mb-1 flex items-center gap-0.5 rounded-full bg-background/90 backdrop-blur px-1.5 py-0.5 shadow-card border border-border/50 transition-transform",
                  active && "scale-110"
                )}
              >
                <Star className="h-2.5 w-2.5 fill-status-busy text-status-busy" strokeWidth={2} />
                <span className="text-[9px] font-bold text-foreground tabular-nums leading-none">
                  {overallScore(s).toFixed(1)}
                </span>
              </span>
              <span className="relative flex items-center justify-center">
                {s.status === "open" && (
                  <span className="absolute inline-flex h-10 w-10 rounded-full bg-status-open opacity-50 animate-pulse-ring" />
                )}
                <span
                  className={cn(
                    "relative h-8 w-8 rounded-full ring-4 ring-background flex items-center justify-center shadow-card transition-transform ease-soft",
                    statusColor[s.status],
                    active && "scale-125 ring-primary"
                  )}
                >
                  <span className="text-[10px] font-bold text-background">
                    {s.isFree ? "$0" : `$${s.pricePerHour}`}
                  </span>
                </span>
              </span>
            </span>
          </button>
        );
      })}

      {/* User location dot */}
      <div className="absolute left-[42%] top-[62%] -translate-x-1/2 -translate-y-1/2">
        <span className="relative flex h-4 w-4">
          <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-accent ring-4 ring-background" />
        </span>
      </div>
    </div>
  );
};
