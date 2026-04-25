import { normalizeParkingLotList } from "./parkingLotSchema";

const MOCK_LOTS = [
  {
    lotId: "mock-1",
    name: "Pike Place Street Zone",
    lat: 47.6094,
    lng: -122.3422,
    totalStalls: 22,
    estimatedAvailable: 5,
    confidence: 0.65,
    isEstimate: true,
    lastReportedMinutesAgo: 44,
    pricePerHour: null,
    category: "metered",
    timePattern: "busy",
    freshnessLabel: "Updated 44m ago"
  },
  {
    lotId: "mock-2",
    name: "Seattle Center Overflow",
    lat: 47.6219,
    lng: -122.3519,
    totalStalls: 90,
    estimatedAvailable: 41,
    confidence: 0.35,
    isEstimate: true,
    lastReportedMinutesAgo: null,
    pricePerHour: 4,
    category: "garage",
    timePattern: "moderate",
    freshnessLabel: "Estimated"
  },
  {
    lotId: "mock-3",
    name: "SLU Neighborhood Free Lot",
    lat: 47.6228,
    lng: -122.3383,
    totalStalls: 35,
    estimatedAvailable: 18,
    confidence: 0.9,
    isEstimate: false,
    lastReportedMinutesAgo: 12,
    pricePerHour: null,
    category: "free",
    timePattern: "quiet",
    freshnessLabel: "Live"
  }
];

/**
 * Returns normalized mock lots for demo-safe fallback mode.
 * @returns {import("./parkingLotSchema").ParkingLot[]}
 */
export function getMockParkingLots() {
  return normalizeParkingLotList(MOCK_LOTS);
}
