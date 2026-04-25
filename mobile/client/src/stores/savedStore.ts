// Saved bookmarks data layer.
// Currently uses localStorage as a placeholder so the UI is fully functional.
//
// 🔌 FIREBASE WIRING:
// Replace the body of each function with Firestore calls, e.g.:
//
//   import { db } from "./firebase";
//   import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
//
//   const col = (uid: string) => collection(db, "users", uid, "savedSpots");
//
//   export async function listSavedSpots(uid: string) {
//     const snap = await getDocs(col(uid));
//     return snap.docs.map(d => d.data() as SavedSpot);
//   }
//
// Because the app is anonymous, you can use Firebase Anonymous Auth and key
// documents by the anonymous uid. The hook below is already async-ready.

import { useCallback, useEffect, useState } from "react";
import { SAVED, SavedDestination, SPOTS } from "./mock-data";

export interface SavedSpot {
  id: string; // ParkingSpot id
  savedAt: number;
}

const SPOT_KEY = "seapark.saved.spots";
const DEST_KEY = "seapark.saved.destinations";

// ---------- Spots ----------
export async function listSavedSpots(): Promise<SavedSpot[]> {
  try {
    const raw = localStorage.getItem(SPOT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Seed with first 2 spots so the UI is never empty in dev
  const seed: SavedSpot[] = SPOTS.slice(0, 2).map((s) => ({
    id: s.id,
    savedAt: Date.now(),
  }));
  localStorage.setItem(SPOT_KEY, JSON.stringify(seed));
  return seed;
}

export async function toggleSavedSpot(spotId: string): Promise<SavedSpot[]> {
  const current = await listSavedSpots();
  const exists = current.find((s) => s.id === spotId);
  const next = exists
    ? current.filter((s) => s.id !== spotId)
    : [...current, { id: spotId, savedAt: Date.now() }];
  localStorage.setItem(SPOT_KEY, JSON.stringify(next));
  return next;
}

// ---------- Destinations ----------
export async function listSavedDestinations(): Promise<SavedDestination[]> {
  try {
    const raw = localStorage.getItem(DEST_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(DEST_KEY, JSON.stringify(SAVED));
  return SAVED;
}

export async function addSavedDestination(d: SavedDestination): Promise<SavedDestination[]> {
  const current = await listSavedDestinations();
  const next = [...current, d];
  localStorage.setItem(DEST_KEY, JSON.stringify(next));
  return next;
}

export async function removeSavedDestination(id: string): Promise<SavedDestination[]> {
  const current = await listSavedDestinations();
  const next = current.filter((d) => d.id !== id);
  localStorage.setItem(DEST_KEY, JSON.stringify(next));
  return next;
}

// ---------- React hook ----------
export function useSaved() {
  const [spots, setSpots] = useState<SavedSpot[]>([]);
  const [destinations, setDestinations] = useState<SavedDestination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([listSavedSpots(), listSavedDestinations()]).then(([s, d]) => {
      if (!alive) return;
      setSpots(s);
      setDestinations(d);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const toggleSpot = useCallback(async (id: string) => {
    setSpots(await toggleSavedSpot(id));
  }, []);

  const isSaved = useCallback(
    (id: string) => spots.some((s) => s.id === id),
    [spots]
  );

  return { spots, destinations, loading, toggleSpot, isSaved };
}
