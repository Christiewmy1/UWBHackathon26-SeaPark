import { useCallback, useEffect, useState } from "react";
import { getMockParkingLots } from "../data/mockParkingLots";
import { getSdotParkingLots } from "../data/sdotService";

/**
 * Loads parking lots with live-first behavior and demo-safe fallback.
 * @returns {Promise<{ lots: import("../data/parkingLotSchema").ParkingLot[], source: "live"|"mock", degraded: boolean }>}
 */
export async function loadAvailabilityLots() {
  const liveLots = await getSdotParkingLots();
  if (liveLots.length > 0) {
    return { lots: liveLots, source: "live", degraded: false };
  }
  return { lots: getMockParkingLots(), source: "mock", degraded: true };
}

/**
 * Hook that exposes lots for map rendering and refresh.
 * @returns {{ lots: import("../data/parkingLotSchema").ParkingLot[], loading: boolean, error: string|null, source: "live"|"mock", refresh: () => Promise<void> }}
 */
export function useAvailability() {
  const [lots, setLots] = useState(() => getMockParkingLots());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState("mock");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await loadAvailabilityLots();
      setLots(result.lots);
      setSource(result.source);
      setError(result.degraded ? "Using fallback demo data" : null);
    } catch (err) {
      console.error("Availability refresh failed", err);
      setError("Unable to load live data. Showing demo lots.");
      setLots(getMockParkingLots());
      setSource("mock");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      if (!isMounted) {
        return;
      }
      await refresh();
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [refresh]);

  return { lots, loading, error, source, refresh };
}
