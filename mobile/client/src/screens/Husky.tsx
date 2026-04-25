import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { ChatMessage, SEED_CHAT } from "@/services/mockData";
import { Send, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
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
      // Stub assistant reply — backend will replace this with the real LLM call
      {
        id: `a-${Date.now() + 1}`,
        role: "assistant",
        content:
          "Got it — I'm pulling **live SDOT data** and recent SeaPark reports. Connect Firebase to stream the real answer here.",
        time: now,
      },
    ]);
    setInput("");
  };

  return (
    <PhoneFrame>
      <div className="relative h-full w-full flex flex-col bg-background">
        {/* Header */}
        <header className="px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="relative">
              <div className="h-11 w-11 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-status-open ring-2 ring-background" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground leading-none">
                Husky AI
              </h1>
              <p className="text-xs text-muted-foreground">Seattle parking concierge · Online</p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex animate-fade-in",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[82%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-gradient-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                )}
              >
                <div className="prose prose-sm prose-invert max-w-none [&_p]:my-0 [&_strong]:text-inherit">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
                <div
                  className={cn(
                    "text-[10px] mt-1 opacity-60",
                    m.role === "user" ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Suggestion chips */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="shrink-0 rounded-full border border-border bg-card/50 hover:bg-muted px-3.5 py-2 text-xs text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Composer */}
        <div className="px-4 pb-28 pt-2 border-t border-border/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="glass rounded-2xl flex items-center gap-2 pl-4 pr-1.5 py-1.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Husky anything…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-2"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow disabled:opacity-40 disabled:shadow-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
};

export default Husky;
