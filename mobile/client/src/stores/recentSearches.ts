import { useCallback, useEffect, useState } from "react";

const KEY = "seapark.recent.searches";
const MAX = 6;

const SEED = ["Pike Place", "South Lake Union", "Capitol Hill", "Climate Pledge"];

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(KEY, JSON.stringify(SEED));
  return SEED;
}

export function useRecentSearches() {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    setRecents(read());
  }, []);

  const push = useCallback((q: string) => {
    const v = q.trim();
    if (!v) return;
    setRecents((prev) => {
      const next = [v, ...prev.filter((r) => r.toLowerCase() !== v.toLowerCase())].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((q: string) => {
    setRecents((prev) => {
      const next = prev.filter((r) => r !== q);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    setRecents([]);
  }, []);

  return { recents, push, remove, clear };
}
