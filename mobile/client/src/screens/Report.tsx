import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, LogOut, Ban, ArrowLeft, Shield, Sparkles, Maximize2, MessageSquarePlus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MAX_NOTE = 100;


type ReportType = "parked" | "leaving" | "full" | null;

const OPTIONS = [
  {
    id: "parked" as const,
    icon: CheckCircle2,
    title: "Just parked",
    desc: "Confirm you took a spot here",
    tone: "open" as const,
  },
  {
    id: "leaving" as const,
    icon: LogOut,
    title: "Leaving now",
    desc: "Alert others a spot is opening",
    tone: "busy" as const,
  },
  {
    id: "full" as const,
    icon: Ban,
    title: "Street is full",
    desc: "Mark this area as packed",
    tone: "full" as const,
  },
];

const Report = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<ReportType>(null);
  const [scores, setScores] = useState({ safe: 4, clean: 4, space: 4 });
  const [note, setNote] = useState("");
  const [ratingsOpen, setRatingsOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const submit = () => {
    toast.success("Thanks! Map updated.", {
      description: note.trim()
        ? `Note: "${note.trim().slice(0, 60)}${note.trim().length > 60 ? "…" : ""}"`
        : "Your one-tap report helped 3 nearby drivers.",
    });
    navigate("/");
  };

  const remaining = MAX_NOTE - note.length;

  return (
    <PhoneFrame>
      <div className="relative h-full w-full flex flex-col bg-background">
        <header className="px-5 pt-[calc(env(safe-area-inset-top)+1rem)] pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
              One-tap report
            </p>
            <h1 className="font-display font-bold text-xl text-foreground leading-tight">
              What's happening here?
            </h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-40 pt-3 scrollbar-hide space-y-3">
          {OPTIONS.map((o) => {
            const active = selected === o.id;
            return (
              <button
                key={o.id}
                onClick={() => setSelected(o.id)}
                className={cn(
                  "w-full rounded-2xl p-4 flex items-center gap-4 border-2 transition-all ease-soft text-left",
                  active
                    ? "border-primary bg-primary/10 shadow-glow"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <div
                  className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0",
                    o.tone === "open" && "bg-status-open/15 text-status-open",
                    o.tone === "busy" && "bg-status-busy/15 text-status-busy",
                    o.tone === "full" && "bg-status-full/15 text-status-full"
                  )}
                >
                  <o.icon className="h-7 w-7" strokeWidth={2.2} />
                </div>
                <div className="flex-1">
                  <div className="font-display font-bold text-base text-foreground">{o.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{o.desc}</div>
                </div>
                <div
                  className={cn(
                    "h-5 w-5 rounded-full border-2",
                    active ? "border-primary bg-primary" : "border-border"
                  )}
                />
              </button>
            );
          })}

          {/* Optional ratings (collapsible) */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden mt-2">
            <button
              type="button"
              onClick={() => setRatingsOpen((v) => !v)}
              aria-expanded={ratingsOpen}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
            >
              <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">Optional: rate the spot</div>
                <p className="text-xs text-muted-foreground">Help others know what to expect.</p>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  ratingsOpen && "rotate-180"
                )}
              />
            </button>
            {ratingsOpen && (
              <div className="px-4 pb-4 pt-1 animate-fade-in">
                {[
                  { key: "safe", label: "Safety", icon: Shield },
                  { key: "clean", label: "Cleanliness", icon: Sparkles },
                  { key: "space", label: "Space", icon: Maximize2 },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center gap-3 py-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground flex-1">{label}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setScores((s) => ({ ...s, [key]: n }))}
                          className={cn(
                            "h-7 w-7 rounded-lg text-xs font-semibold transition-colors",
                            (scores as any)[key] >= n
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional quick note (collapsible) */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setNoteOpen((v) => !v)}
              aria-expanded={noteOpen}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
            >
              <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <MessageSquarePlus className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Leave a quick note
                  {note.trim() && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">
                      Added
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {note.trim() || `Add context — up to ${MAX_NOTE} characters.`}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                  noteOpen && "rotate-180"
                )}
              />
            </button>
            {noteOpen && (
              <div className="px-4 pb-4 pt-1 animate-fade-in">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE))}
                  placeholder="e.g. 3 spots open on level 2, well lit"
                  className="min-h-[70px] resize-none bg-background/60 border-border/40 text-sm rounded-xl"
                  maxLength={MAX_NOTE}
                  autoFocus
                />
                <div className="mt-2 flex justify-end">
                  <span
                    className={cn(
                      "text-[11px] tabular-nums",
                      remaining <= 10 ? "text-status-busy" : "text-muted-foreground"
                    )}
                  >
                    {remaining} chars left
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="absolute left-0 right-0 bottom-24 px-5 z-30">
          <Button
            disabled={!selected}
            onClick={submit}
            className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow text-base font-semibold disabled:opacity-40 disabled:shadow-none"
          >
            Send report
          </Button>
        </div>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
};

export default Report;
