import { useEffect, useRef, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { ChatMessage, SEED_CHAT } from "@/services/mockData";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Where can I park free near Pike Place?",
  "Any open spots in SLU right now?",
  "Is street parking free today?",
  "Cheapest spot for the Kraken game?",
];

const Husky = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_CHAT);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setMessages((m) => [
      ...m,
      { id: `u-${Date.now()}`, role: "user", content: trimmed, time: now },
      {
        id: `a-${Date.now() + 1}`,
        role: "assistant",
        content:
          "Got it — I'm pulling live SDOT data and recent SeaPark reports. Connect Firebase to stream the real answer here.",
        time: now,
      },
    ]);
    setInput("");
  };

  return (
    <PhoneFrame>
      <div className="relative h-full w-full flex flex-col bg-background">
        {/* Header */}
        <header className="px-4 pb-3 border-b border-border/50">
          <div className="flex items-center gap-3 pt-[calc(env(safe-area-inset-top)+1rem)]">
            <div className="h-11 w-11 rounded-2xl bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">Husky AI</h1>
              <p className="text-xs text-muted-foreground">Seattle parking concierge · Online</p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-4 space-y-3 scrollbar-hide">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex animate-fade-in", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[82%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                )}
              >
                <div>{m.content}</div>
                <div className={cn("text-[10px] mt-1 opacity-60", m.role === "user" ? "text-primary-foreground" : "text-muted-foreground")}>
                  {m.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="shrink-0 rounded-full border border-border bg-card hover:bg-muted px-4 py-2 text-xs text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Composer */}
        <div className="px-4 pb-28 pt-2 border-t border-border/50 bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Husky anything…"
              className="flex-1 bg-muted/50 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className={cn(
                "h-11 w-11 rounded-xl flex items-center justify-center transition-all",
                input.trim() ? "bg-primary" : "bg-muted"
              )}
            >
              <Send className={cn("h-4 w-4", input.trim() ? "text-primary-foreground" : "text-muted-foreground")} />
            </button>
          </form>
        </div>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
};

export default Husky;
