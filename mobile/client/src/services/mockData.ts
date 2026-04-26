// Mock data for SeaPark UI. Replace with Firebase + Google Maps wiring.

export type SpotStatus = "open" | "busy" | "full";

export interface ParkingSpot {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  status: SpotStatus;
  isFree: boolean;
  pricePerHour: number; // 0 if free
  timeLimit: string;
  distanceMin: number; // walking minutes
  safetyScore: number; // 1-5
  cleanScore: number;
  spaceScore: number;
  isRPZ: boolean;
  lat: number;
  lng: number;
  recentNote?: string;
  recentAuthor?: string;
  recentMinutesAgo?: number;
  available?: number;
  total?: number;
}

/** Overall spot rating = average of safety, cleanliness, and space scores. */
export const overallScore = (s: Pick<ParkingSpot, "safetyScore" | "cleanScore" | "spaceScore">) =>
  (s.safetyScore + s.cleanScore + s.spaceScore) / 3;


export const SPOTS: ParkingSpot[] = [
  {
    id: "s1",
    name: "Pike Place Garage",
    address: "1531 Western Ave",
    neighborhood: "Downtown",
    status: "busy",
    isFree: false,
    pricePerHour: 4.5,
    timeLimit: "No limit",
    distanceMin: 3,
    safetyScore: 4.6,
    cleanScore: 4.2,
    spaceScore: 3.8,
    isRPZ: false,
    lat: 47.6097,
    lng: -122.3422,
    recentNote: "Filling up fast — 2 spots on level 3.",
    recentAuthor: "Maya R.",
    recentMinutesAgo: 4,
    available: 12,
    total: 240,
  },
  {
    id: "s2",
    name: "Western Ave Load Zone",
    address: "Western Ave & Virginia",
    neighborhood: "Belltown",
    status: "open",
    isFree: true,
    pricePerHour: 0,
    timeLimit: "15 min load",
    distanceMin: 5,
    safetyScore: 4.1,
    cleanScore: 3.6,
    spaceScore: 4.4,
    isRPZ: false,
    lat: 47.6105,
    lng: -122.3445,
    recentNote: "Open right now, just dropped a friend.",
    recentAuthor: "Jordan T.",
    recentMinutesAgo: 1,
  },
  {
    id: "s3",
    name: "9th Ave Street Parking",
    address: "9th Ave & Lenora",
    neighborhood: "South Lake Union",
    status: "full",
    isFree: false,
    pricePerHour: 2.5,
    timeLimit: "2 hr, 8a–6p",
    distanceMin: 2,
    safetyScore: 4.4,
    cleanScore: 4.0,
    spaceScore: 3.5,
    isRPZ: false,
    lat: 47.6155,
    lng: -122.3360,
    recentNote: "Completely packed during commute.",
    recentAuthor: "Devon K.",
    recentMinutesAgo: 8,
    available: 0,
    total: 24,
  },
  {
    id: "s4",
    name: "Capitol Hill RPZ-7",
    address: "E Olive Way",
    neighborhood: "Capitol Hill",
    status: "open",
    isFree: true,
    pricePerHour: 0,
    timeLimit: "Permit only",
    distanceMin: 7,
    safetyScore: 4.0,
    cleanScore: 3.8,
    spaceScore: 4.2,
    isRPZ: true,
    lat: 47.6180,
    lng: -122.3260,
    recentNote: "Permit zone — non-residents get $50 ticket.",
    recentAuthor: "City Data",
    recentMinutesAgo: 30,
  },
  {
    id: "s5",
    name: "Target Garage",
    address: "1401 2nd Ave",
    neighborhood: "Downtown",
    status: "open",
    isFree: true,
    pricePerHour: 0,
    timeLimit: "Free w/ $10 spend",
    distanceMin: 4,
    safetyScore: 4.7,
    cleanScore: 4.5,
    spaceScore: 4.6,
    isRPZ: false,
    lat: 47.6088,
    lng: -122.3380,
    recentNote: "Well-lit, lots of cameras. Validate inside.",
    recentAuthor: "Priya S.",
    recentMinutesAgo: 12,
    available: 84,
    total: 320,
  },
  {
    id: "s6",
    name: "Climate Pledge Lot B",
    address: "1st Ave N & Republican",
    neighborhood: "Lower Queen Anne",
    status: "busy",
    isFree: false,
    pricePerHour: 8,
    timeLimit: "Event pricing",
    distanceMin: 6,
    safetyScore: 4.5,
    cleanScore: 4.3,
    spaceScore: 4.0,
    isRPZ: false,
    lat: 47.6225,
    lng: -122.3535,
    recentNote: "Kraken game tonight — try Light Rail instead.",
    recentAuthor: "Husky AI",
    recentMinutesAgo: 2,
    available: 40,
    total: 600,
  },
];

export const NEIGHBORHOODS = [
  "Downtown", "Belltown", "South Lake Union", "Capitol Hill", "Lower Queen Anne", "Ballard", "Fremont",
];

export interface SavedDestination {
  id: string;
  label: string;
  address: string;
  emoji: string;
}

export const SAVED: SavedDestination[] = [
  { id: "d1", label: "Home", address: "Capitol Hill", emoji: "🏠" },
  { id: "d2", label: "Work — SLU", address: "9th Ave & Mercer", emoji: "💼" },
  { id: "d3", label: "Pike Place", address: "Western Ave", emoji: "🐟" },
  { id: "d4", label: "Climate Pledge", address: "Seattle Center", emoji: "🏒" },
];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

export const SEED_CHAT: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    content:
      "Morning! 🌧️ The **usual spot on 9th Ave is full**, but there's an opening on 8th Ave & Lenora — about a 2-min walk from your office. Want me to route you there?",
    time: "8:14 AM",
  },
];
