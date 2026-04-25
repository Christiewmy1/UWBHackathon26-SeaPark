import { buildQualityFields, deriveTimePattern, estimateAvailable } from "./availabilityEngine";
import { getMeterFreeToday } from "./holidayLogic";

/**
 * @typedef {Object} ParkingLot
 * @property {string} lotId
 * @property {string} name
 * @property {number} lat
 * @property {number} lng
 * @property {number} totalStalls
 * @property {number} estimatedAvailable
 * @property {number} confidence
 * @property {boolean} isEstimate
 * @property {number|null} lastReportedMinutesAgo
 * @property {number|null} pricePerHour
 * @property {"free"|"metered"|"garage"} category
 * @property {boolean} meterFreeToday
 * @property {"quiet"|"moderate"|"busy"} timePattern
 * @property {"Live"|"Estimated"|string} freshnessLabel
 */

/**
 * Coerces category to one of the agreed contract values.
 * @param {string|undefined|null} category
 * @returns {"free"|"metered"|"garage"}
 */
export function normalizeCategory(category) {
  if (category === "free" || category === "metered" || category === "garage") {
    return category;
  }
  return "metered";
}

/**
 * Converts source payload into the canonical ParkingLot shape.
 * @param {Object} raw
 * @param {Date} [today=new Date()]
 * @returns {ParkingLot}
 */
export function normalizeParkingLot(raw, today = new Date()) {
  const lotId = String(raw.lotId ?? raw.facility_id ?? raw.id ?? "");
  const name = String(raw.name ?? raw.facility_name ?? "Unknown Lot");
  const lat = Number(raw.lat ?? raw.latitude ?? 0);
  const lng = Number(raw.lng ?? raw.longitude ?? 0);
  const totalStalls = Number(raw.totalStalls ?? raw.total_spaces ?? 0);
  const category = normalizeCategory(raw.category);
  const lastReportedMinutesAgo =
    raw.lastReportedMinutesAgo == null ? null : Number(raw.lastReportedMinutesAgo);

  const inferredTimePattern =
    raw.timePattern === "quiet" || raw.timePattern === "moderate" || raw.timePattern === "busy"
      ? raw.timePattern
      : "moderate";

  const estimatedAvailable =
    raw.estimatedAvailable == null
      ? estimateAvailable(totalStalls, inferredTimePattern)
      : Number(raw.estimatedAvailable);

  const timePattern = raw.timePattern
    ? raw.timePattern
    : deriveTimePattern(estimatedAvailable, totalStalls);

  const quality = buildQualityFields(lastReportedMinutesAgo);

  return {
    lotId,
    name,
    lat,
    lng,
    totalStalls,
    estimatedAvailable,
    confidence: raw.confidence == null ? quality.confidence : Number(raw.confidence),
    isEstimate: raw.isEstimate == null ? quality.isEstimate : Boolean(raw.isEstimate),
    lastReportedMinutesAgo,
    pricePerHour: raw.pricePerHour == null ? null : Number(raw.pricePerHour),
    category,
    meterFreeToday:
      raw.meterFreeToday == null ? getMeterFreeToday(category, today) : Boolean(raw.meterFreeToday),
    timePattern,
    freshnessLabel: raw.freshnessLabel ?? quality.freshnessLabel
  };
}

/**
 * Validates a parking lot contract object.
 * @param {Object} lot
 * @returns {boolean}
 */
export function isParkingLot(lot) {
  if (!lot || typeof lot !== "object") {
    return false;
  }

  const categoryOk = ["free", "metered", "garage"].includes(lot.category);
  const timePatternOk = ["quiet", "moderate", "busy"].includes(lot.timePattern);

  return (
    typeof lot.lotId === "string" &&
    lot.lotId.length > 0 &&
    typeof lot.name === "string" &&
    Number.isFinite(lot.lat) &&
    Number.isFinite(lot.lng) &&
    Number.isFinite(lot.totalStalls) &&
    Number.isFinite(lot.estimatedAvailable) &&
    Number.isFinite(lot.confidence) &&
    typeof lot.isEstimate === "boolean" &&
    (lot.lastReportedMinutesAgo === null || Number.isFinite(lot.lastReportedMinutesAgo)) &&
    (lot.pricePerHour === null || Number.isFinite(lot.pricePerHour)) &&
    categoryOk &&
    typeof lot.meterFreeToday === "boolean" &&
    timePatternOk &&
    typeof lot.freshnessLabel === "string"
  );
}

/**
 * Normalizes and filters to only valid parking lot records.
 * @param {Object[]} records
 * @param {Date} [today=new Date()]
 * @returns {ParkingLot[]}
 */
export function normalizeParkingLotList(records, today = new Date()) {
  return records
    .map((record) => normalizeParkingLot(record, today))
    .filter((lot) => isParkingLot(lot));
}
