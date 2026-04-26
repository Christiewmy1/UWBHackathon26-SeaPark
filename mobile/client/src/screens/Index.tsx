import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, Layers, Locate, Sparkles, Bookmark, Clock, X } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { MapCanvas } from "@/components/MapCanvas";
import { SpotDetailsSheet } from "@/components/SpotDetailsSheet";
import { SavedSheet } from "@/components/SavedSheet";
import { SPOTS, ParkingSpot } from "@/services/mockData";
import { fetchParkingSpots } from "@/services/parkingApi";
import { useRecentSearches } from "@/stores/recentSearches";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const Map = () => {
  const [spots, setSpots] = useState<ParkingSpot[]>(SPOTS);
  const [freeOnly, setFreeOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [savedOpen, setSavedOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    fetchParkingSpots()
      .then(setSpots)
      .catch(() => {/* stay on SPOTS fallback */});
  }, []);
  const { recents, push: pushRecent, remove: removeRecent, clear: clearRecents } = useRecentSearches();
  const blurTimer = useRef<number | null>(null);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recents;
    const filtered = recents.filter((r) => r.toLowerCase().includes(q));
    // Also surface matching neighborhoods/spots that aren't yet in recents
    const fromSpots = Array.from(
      new Set(
        spots.flatMap((s) => [s.name, s.neighborhood]).filter(
          (v) => v.toLowerCase().includes(q) && !filtered.some((r) => r.toLowerCase() === v.toLowerCase())
        )
      )
    ).slice(0, 5);
    return [...filtered, ...fromSpots];
  }, [query, recents]);

  const showSuggestions = searchFocused && suggestions.length > 0;

  const commitSearch = (value: string) => {
    setQuery(value);
    pushRecent(value);
    setSearchFocused(false);
  };

  const visible = useMemo(
    () => spots.filter((s) => (!freeOnly || s.isFree) && (!query || s.name.toLowerCase().includes(query.toLowerCase()) || s.neighborhood.toLowerCase().includes(query.toLowerCase()))),
    [spots, freeOnly, query]
  );

  const selected = visible.find((s) => s.id === selectedId) ?? null;

  return (
    <PhoneFrame>
      <div className="relative h-full w-full bg-background overflow-hidden">
        <MapCanvas spots={visible} selectedId={selectedId ?? undefined} onSelect={setSelectedId} />

        {/* Top status bar */}
        <div className="absolute top-0 inset-x-0 z-20 pt-[env(safe-area-inset-top)]">
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                  Good morning · Seattle
                </p>
                <h1 className="font-display text-xl font-bold text-foreground leading-tight">
                  {visible.filter((s) => s.status === "open").length} open spots near you
                </h1>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSavedOpen(true)}
                  className="h-11 w-11 rounded-2xl glass shadow-card flex items-center justify-center text-foreground"
                  aria-label="Saved spots"
                >
                  <Bookmark className="h-5 w-5" />
                </button>
                <Link
                  to="/husky"
                  className="h-11 w-11 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow"
                  aria-label="Husky AI"
                >
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </Link>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative">
              <div
                className={cn(
                  "glass rounded-2xl flex items-center gap-2 px-3 h-12 shadow-card transition-all",
                  showSuggestions && "rounded-b-none"
                )}
              >
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => {
                    if (blurTimer.current) window.clearTimeout(blurTimer.current);
                    setSearchFocused(true);
                  }}
                  onBlur={() => {
                    // Delay so onMouseDown on a suggestion can fire first
                    blurTimer.current = window.setTimeout(() => setSearchFocused(false), 120);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && query.trim()) commitSearch(query);
                    if (e.key === "Escape") setSearchFocused(false);
                  }}
                  placeholder="Where are we heading?"
                  className="bg-transparent flex-1 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setFreeOnly((v) => !v)}
                  aria-label={freeOnly ? "Show all spots" : "Show only free spots"}
                  aria-pressed={freeOnly}
                  className={cn(
                    "h-8 px-2.5 rounded-xl flex items-center gap-1 text-xs font-semibold transition-colors",
                    freeOnly
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/70 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {freeOnly && <span>Free</span>}
                </button>
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && (
                <div className="absolute inset-x-0 top-full glass rounded-b-2xl shadow-card border-t border-border/40 overflow-hidden animate-fade-in z-30">
                  <div className="flex items-center justify-between px-4 pt-3 pb-1">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                      {query.trim() ? "Suggestions" : "Recent searches"}
                    </p>
                    {!query.trim() && recents.length > 0 && (
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          clearRecents();
                        }}
                        className="text-[10px] uppercase tracking-widest font-semibold text-primary hover:opacity-80"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <ul className="pb-2 max-h-72 overflow-y-auto scrollbar-hide">
                    {suggestions.map((s) => {
                      const isRecent = recents.includes(s);
                      return (
                        <li key={s}>
                          <div className="group flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors">
                            <button
                              onMouseDown={(e) => {
                                e.preventDefault();
                                commitSearch(s);
                              }}
                              className="flex items-center gap-3 flex-1 min-w-0 text-left"
                            >
                              <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                                {isRecent ? (
                                  <Clock className="h-4 w-4" />
                                ) : (
                                  <Search className="h-4 w-4" />
                                )}
                              </div>
                              <span className="text-sm text-foreground truncate">{s}</span>
                            </button>
                            {isRecent && (
                              <button
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  removeRecent(s);
                                }}
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity"
                                aria-label={`Remove ${s}`}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right-side map controls */}
        <div
          className={cn(
            "absolute right-3 top-44 flex flex-col gap-2 transition-opacity",
            showSuggestions ? "z-0 opacity-0 pointer-events-none" : "z-20 opacity-100"
          )}
        >
          <button className="h-11 w-11 rounded-2xl glass shadow-card flex items-center justify-center text-foreground">
            <Layers className="h-5 w-5" />
          </button>
          <button className="h-11 w-11 rounded-2xl glass shadow-card flex items-center justify-center text-primary">
            <Locate className="h-5 w-5" />
          </button>
        </div>

        {/* Heat-map legend + Free toggle */}
        {!selected && (
          <div className="absolute left-3 right-3 bottom-28 z-20 flex flex-col gap-2 animate-fade-in">
            <div className="glass rounded-2xl p-3 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Filter</p>
                  <p className="font-semibold text-foreground text-sm">Free spots only</p>
                </div>
                <Switch
                  checked={freeOnly}
                  onCheckedChange={setFreeOnly}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-gradient-heat" />
              <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>Open</span>
                <span>Filling up</span>
                <span>Full</span>
              </div>
            </div>

            {/* Quick spot list */}
            <div className="glass rounded-2xl p-2 shadow-card">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {visible.slice(0, 5).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className="shrink-0 w-44 text-left rounded-xl bg-muted/50 hover:bg-muted p-3 transition-colors"
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
