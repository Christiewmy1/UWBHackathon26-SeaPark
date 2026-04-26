import { useCallback, useEffect, useState } from "react";
import { subscribeToParkingLots } from "../services/firebase";

/**
 * Hook that exposes live parking lots from Firebase with real-time updates.
 * @returns {{ lots: import("../types").ParkingLot[], loading: boolean, error: string|null, source: string, refresh: () => void }}
 */
export function useAvailability() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState("firebase");

  useEffect(() => {
    let active = true;

    const unsubscribe = subscribeToParkingLots((firebaseLots) => {
      if (!active) return;
      setLots(firebaseLots);
      setSource("firebase");
      setLoading(false);
      setError(null);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Firebase subscription auto-refreshes on data changes; this is a no-op trigger
  const refresh = useCallback(() => {}, []);

  return { lots, loading, error, source, refresh };
}
