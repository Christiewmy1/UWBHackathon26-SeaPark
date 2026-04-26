import { ParkingSpot } from "./mockData";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

interface BackendLot {
  lotId: string;
  name: string;
  address: string;
  sdotArea?: string;
  category: string;
  pricePerHour: number | null;
  meterFreeToday: boolean;
  timePattern: string;
  estimatedAvailable: number;
  totalStalls: number;
  freshnessLabel: string;
  confidence: number;
  lat: number;
  lng: number;
}

function toStatus(timePattern: string, available: number, total: number): "open" | "busy" | "full" {
  if (total > 0 && available / total < 0.05) return "full";
  if (timePattern === "busy") return "busy";
  if (timePattern === "quiet") return "open";
  return "busy";
}

export function backendLotToSpot(lot: BackendLot): ParkingSpot {
  const isFree = lot.meterFreeToday || lot.category === "free" || !lot.pricePerHour;
  return {
    id: lot.lotId,
    name: lot.name,
    address: lot.address,
    neighborhood: lot.sdotArea ?? lot.category,
    status: toStatus(lot.timePattern, lot.estimatedAvailable, lot.totalStalls),
    isFree,
    pricePerHour: lot.pricePerHour ?? 0,
    timeLimit: lot.meterFreeToday ? "Free today" : "Check signs",
    distanceMin: Math.floor(Math.random() * 8) + 2,
    safetyScore: 4.0,
    cleanScore: 4.0,
    spaceScore: lot.totalStalls > 200 ? 4.5 : 3.5,
    isRPZ: false,
    lat: lot.lat,
    lng: lot.lng,
    recentNote: lot.freshnessLabel,
    recentAuthor: "SeaPark",
    recentMinutesAgo: 0,
    available: lot.estimatedAvailable,
    total: lot.totalStalls,
  };
}

export async function fetchParkingSpots(): Promise<ParkingSpot[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${API_BASE}/api/v1/parking/lots`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: BackendLot[] = await res.json();
    return data.map(backendLotToSpot);
  } finally {
    clearTimeout(timer);
  }
}
