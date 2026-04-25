import { normalizeParkingLotList } from "./parkingLotSchema";

const SDOT_LOTS_URL = "https://data.seattle.gov/resource/3qbw-quib.json?$limit=500";

/**
 * Fetches Seattle parking facilities from SDOT open data.
 * @returns {Promise<Object[]>}
 */
export async function fetchSdotRawLots() {
  try {
    const response = await fetch(SDOT_LOTS_URL);
    if (!response.ok) {
      console.error("SDOT lots request failed", response.status);
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("SDOT lots request error", error);
    return [];
  }
}

/**
 * Maps SDOT records to SeaPark contract records.
 * @param {Object[]} source
 * @returns {import("./parkingLotSchema").ParkingLot[]}
 */
export function mapSdotToParkingLots(source) {
  const rows = Array.isArray(source) ? source : [];

  const mapped = rows
    .filter((row) => row?.latitude && row?.longitude)
    .map((row) => {
      const latitude = Number(row.latitude);
      const longitude = Number(row.longitude);
      const totalSpaces = Number(row.total_spaces ?? 0);
      const lotTypeRaw = String(row.facility_type ?? "").toLowerCase();

      let category = "metered";
      if (lotTypeRaw.includes("garage")) {
        category = "garage";
      } else if (lotTypeRaw.includes("free")) {
        category = "free";
      }

      return {
        lotId: String(row.facility_id ?? row.eas_id ?? `${latitude}-${longitude}`),
        name: String(row.name ?? row.common_name ?? "Seattle Parking Lot"),
        lat: latitude,
        lng: longitude,
        totalStalls: Number.isFinite(totalSpaces) ? totalSpaces : 0,
        category,
        lastReportedMinutesAgo: 42,
        pricePerHour: null,
        timePattern: "moderate"
      };
    });

  return normalizeParkingLotList(mapped);
}

/**
 * Fetches and normalizes SDOT lot data for app usage.
 * @returns {Promise<import("./parkingLotSchema").ParkingLot[]>}
 */
export async function getSdotParkingLots() {
  const rawLots = await fetchSdotRawLots();
  return mapSdotToParkingLots(rawLots);
}
