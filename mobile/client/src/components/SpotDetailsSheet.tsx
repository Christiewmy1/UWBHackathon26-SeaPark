import { useState } from "react";
import { ParkingSpot, overallScore } from "@/services/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield, Sparkles, Maximize2, Clock, MapPin, Navigation, X, AlertTriangle,
  MessageSquarePlus, Send, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Props {
  spot: ParkingSpot | null;
  onClose: () => void;
}

const MAX_COMMENT = 100;

const ScorePill = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
  <div className="flex-1 rounded-2xl bg-muted/60 p-3">
    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-lg font-display font-bold text-foreground">{value.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">/5</span>
    </div>
  </div>
);

export const SpotDetailsSheet = ({ spot, onClose }: Props) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState("");

  if (!spot) return null;

  const statusLabel =
    spot.status === "open" ? "Available" : spot.status === "busy" ? "Filling Up" : "Full";

  const handleNavigate = () => {
    // Opens the Google Maps app on mobile (deep link), falls back to web on desktop.
    const query = encodeURIComponent(`${spot.name}, ${spot.address}`);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${query}&travelmode=driving`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmitComment = () => {
    const v = comment.trim();
    if (!v) return;
    // TODO: send to Firebase. For now, just toast and close the input.
    toast({
      title: "Comment posted",
      description: `"${v.length > 60 ? v.slice(0, 60) + "…" : v}"`,
    });
    setComment("");
    setCommentOpen(false);
  };

  const remaining = MAX_COMMENT - comment.length;

  return (
    <div className="absolute inset-x-0 bottom-0 z-40 animate-slide-up">
      <div className="glass rounded-t-3xl border-t border-white/10 shadow-elevated px-5 pt-3 pb-32">
        {/* Grabber */}
        <div className="flex justify-center mb-3">
          <div className="h-1.5 w-10 rounded-full bg-muted" />
        </div>

        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  spot.status === "open" && "bg-status-open",
                  spot.status === "busy" && "bg-status-busy",
                  spot.status === "full" && "bg-status-full"
                )}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {statusLabel}
              </span>
            </div>
            <h2 className="font-display font-bold text-xl leading-tight text-foreground truncate">
              {spot.name}
            </h2>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{spot.address}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Price + meta */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-3">
            <div className="text-xs text-primary/80 mb-1">Price</div>
            <div className="font-display font-bold text-lg text-primary">
              {spot.isFree ? "Free" : `$${spot.pricePerHour}/hr`}
            </div>
          </div>
          <div className="rounded-2xl bg-muted/60 p-3 col-span-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Clock className="h-3.5 w-3.5" /> Time limit
            </div>
            <div className="font-semibold text-sm text-foreground">{spot.timeLimit}</div>
          </div>
        </div>

        {/* RPZ warning */}
        {spot.isRPZ && (
          <div className="flex items-start gap-2 rounded-2xl bg-status-full/10 border border-status-full/30 p-3 mb-4">
            <AlertTriangle className="h-4 w-4 text-status-full mt-0.5 shrink-0" />
            <div className="text-xs text-foreground">
              <span className="font-semibold text-status-full">Restricted Parking Zone.</span>{" "}
              Permit required — non-residents risk a $50 ticket.
            </div>
          </div>
        )}

        {/* Overall rating */}
        <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3 mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Overall rating
            </p>
            <p className="text-xs text-muted-foreground">Average of safety, cleanliness, and space</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-status-busy text-status-busy" />
            <span className="font-display font-bold text-xl text-foreground tabular-nums">
              {overallScore(spot).toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">/5</span>
          </div>
        </div>

        {/* Scores */}
        <div className="flex gap-2 mb-4">
          <ScorePill icon={Shield} label="Safe" value={spot.safetyScore} />
          <ScorePill icon={Sparkles} label="Clean" value={spot.cleanScore} />
          <ScorePill icon={Maximize2} label="Space" value={spot.spaceScore} />
        </div>

        {/* Recent feedback */}
        {spot.recentNote && (
          <div className="rounded-2xl bg-muted/40 p-4 mb-4">
            <div className="text-xs text-muted-foreground mb-1.5">
              Recent feedback · {spot.recentAuthor} · {spot.recentMinutesAgo}m ago
            </div>
            <p className="text-sm text-foreground leading-snug">"{spot.recentNote}"</p>
          </div>
        )}

        {/* Quick comment */}
        {commentOpen ? (
          <div className="rounded-2xl bg-muted/40 border border-border/40 p-3 mb-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Add a quick note
              </p>
              <button
                onClick={() => {
                  setCommentOpen(false);
                  setComment("");
                }}
                className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Cancel comment"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
              placeholder="e.g. 3 spots open on level 2, well lit"
              className="min-h-[60px] resize-none bg-background/60 border-border/40 text-sm rounded-xl"
              autoFocus
              maxLength={MAX_COMMENT}
            />
            <div className="mt-2 flex items-center justify-between">
              <span
                className={cn(
                  "text-[11px] tabular-nums",
                  remaining <= 10 ? "text-status-busy" : "text-muted-foreground"
                )}
              >
                {remaining} chars left
              </span>
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={!comment.trim()}
                className="h-8 rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-90"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Post
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCommentOpen(true)}
            className="w-full mb-4 flex items-center gap-2 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-colors p-3 text-left"
          >
            <div className="h-8 w-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
              <MessageSquarePlus className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Leave a quick note</p>
              <p className="text-xs text-muted-foreground">Help drivers — up to 100 characters</p>
            </div>
          </button>
        )}

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1 h-12 rounded-2xl">
            Save spot
          </Button>
          <Button
            onClick={handleNavigate}
            className="flex-[1.4] h-12 rounded-2xl bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
          >
            <Navigation className="h-4 w-4 mr-1.5" />
            Navigate
          </Button>
        </div>

        {spot.available !== undefined && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="rounded-full border-white/10 bg-muted/50">
              {spot.available} of {spot.total} open
            </Badge>
            <span>•</span>
            <span>{spot.distanceMin} min walk</span>
          </div>
        )}
      </div>
    </div>
  );
};
