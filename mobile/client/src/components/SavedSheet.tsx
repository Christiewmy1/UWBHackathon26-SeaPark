import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSaved } from "@/stores/savedStore";
import { SPOTS } from "@/services/mockData";
import { Bookmark, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SavedSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSpot?: (id: string) => void;
}

export const SavedSheet = ({ open, onOpenChange, onSelectSpot }: SavedSheetProps) => {
  const { spots, destinations } = useSaved();
  const savedSpots = SPOTS.filter((s) => spots.some((sv) => sv.id === s.id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-border bg-background p-0 max-h-[85vh] overflow-hidden"
      >
        <SheetHeader className="px-5 pt-5 pb-2 text-left">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
            Saved
          </p>
          <SheetTitle className="font-display font-bold text-2xl text-foreground">
            Your spots
          </SheetTitle>
        </SheetHeader>

        <div className="px-5 pb-8 overflow-y-auto scrollbar-hide max-h-[70vh]">
          {/* Destinations */}
          <section className="mt-3">
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">
              Destinations
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {destinations.map((d) => (
                <button
                  key={d.id}
                  className="rounded-2xl bg-card p-4 text-left border border-border hover:border-primary/40 transition-colors"
                >
                  <div className="text-2xl mb-2">{d.emoji}</div>
                  <div className="font-semibold text-foreground text-sm">{d.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{d.address}</div>
                </button>
              ))}
              <button className="rounded-2xl border border-dashed border-border hover:border-primary/40 p-4 flex flex-col items-center justify-center text-muted-foreground hover:text-primary">
                <Plus className="h-5 w-5 mb-1" />
                <span className="text-xs font-semibold">Add</span>
              </button>
            </div>
          </section>

          {/* Saved parking */}
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">
              Saved parking
            </h2>
            {savedSpots.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Tap the bookmark icon on any spot to save it here.
              </div>
            ) : (
              <div className="space-y-2">
                {savedSpots.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectSpot?.(s.id);
                      onOpenChange(false);
                    }}
                    className="w-full rounded-2xl bg-card p-4 flex items-center gap-3 border border-border hover:border-primary/40 transition-colors text-left"
                  >
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Bookmark className="h-5 w-5 text-primary" fill="currentColor" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            s.status === "open" && "bg-status-open",
                            s.status === "busy" && "bg-status-busy",
                            s.status === "full" && "bg-status-full"
                          )}
                        />
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                          {s.isFree ? "Free" : `$${s.pricePerHour}/hr`} · {s.distanceMin} min
                        </span>
                      </div>
                      <p className="font-semibold text-sm text-foreground truncate">
                        {s.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {s.neighborhood}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};
