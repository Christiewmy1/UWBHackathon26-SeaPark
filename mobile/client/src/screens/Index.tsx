import { useMemo, useState } from "react";
import { Bookmark, Sparkles, Search } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { MapCanvas } from "@/components/MapCanvas";
import { SpotDetailsSheet } from "@/components/SpotDetailsSheet";
import { SavedSheet } from "@/components/SavedSheet";
import { SPOTS } from "@/services/mockData";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const Map = () => {
  const [freeOnly, setFreeOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [savedOpen, setSavedOpen] = useState(false);

  const visible = useMemo(
    () =>
      SPOTS.filter(
        (s) =>
          (!freeOnly || s.isFree) &&
          (!query || s.name.toLowerCase().includes(query.toLowerCase()) || s.neighborhood.toLowerCase().includes(query.toLowerCase()))
      ),
    [freeOnly, query]
  );

  const selected = visible.find((s) => s.id === selectedId) ?? null;

  return (
    <PhoneFrame>
      <div className="relative h-full w-full bg-background overflow-hidden">
        <MapCanvas spots={visible} selectedId={selectedId ?? undefined} onSelect={setSelectedId} />

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 z-20 pt-[env(safe-area-inset-top)]">
          <div className="px-4 pt-3">
            {/* Header with title and action buttons */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 pr-2">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                  Good morning · Seattle
                </p>
                <h1 className="font-display text-xl font-bold text-foreground">
                  {visible.filter((s) => s.status === "open").length} open spots near you
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSavedOpen(true)}
                  className="h-11 w-11 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground"
                  aria-label="Saved spots"
                >
                  <Bookmark className="h-5 w-5" />
                </button>
                <Link
                  to="/husky"
                  className="h-11 w-11 rounded-2xl bg-primary flex items-center justify-center"
                  aria-label="Husky AI"
                >
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </Link>
              </div>
            </div>

            {/* Search bar */}
            <div className="flex items-center gap-2 bg-card border border-border rounded-2xl h-12 px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onSubmit={(e) => e.preventDefault()}
                placeholder="Where are we heading?"
                className="bg-transparent flex-1 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                onClick={() => setFreeOnly((v) => !v)}
                className={cn(
                  "h-8 px-2.5 rounded-xl flex items-center gap-1 text-xs font-semibold transition-colors",
                  freeOnly ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                ⚙️ {freeOnly && <span>Free</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Quick spot list */}
        {!selected && (
          <div className="absolute left-3 right-3 bottom-4 z-10">
            <div className="bg-card border border-border rounded-2xl p-2">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {visible.slice(0, 5).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className="shrink-0 w-44 text-left rounded-xl bg-muted/60 hover:bg-muted p-3 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          s.status === "open" && "bg-status-open",
                          s.status === "busy" && "bg-status-busy",
                          s.status === "full" && "bg-status-full"
                        )}
                      />
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        {s.distanceMin} min · {s.isFree ? "Free" : `$${s.pricePerHour}/hr`}
                      </span>
                    </div>
                    <p className="font-semibold text-sm text-foreground leading-tight truncate">
                      {s.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{s.neighborhood}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <SpotDetailsSheet spot={selected} onClose={() => setSelectedId(null)} />
        <SavedSheet open={savedOpen} onOpenChange={setSavedOpen} onSelectSpot={setSelectedId} />

        <BottomNav />
      </div>
    </PhoneFrame>
  );
};

export default Map;
