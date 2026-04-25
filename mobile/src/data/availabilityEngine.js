/**
 * Clamps a number into a range.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Creates a freshness label based on the minutes ago value.
 * @param {number|null} minutesAgo
 * @returns {"Live"|"Estimated"|string}
 */
export function toFreshnessLabel(minutesAgo) {
  if (minutesAgo == null || !Number.isFinite(minutesAgo)) {
    return "Estimated";
  }
  if (minutesAgo < 30) {
    return "Live";
  }
  return `Updated ${Math.round(minutesAgo)}m ago`;
}

/**
 * Computes confidence score from report recency.
 * @param {number|null} minutesAgo
 * @returns {number}
 */
export function computeConfidence(minutesAgo) {
  if (minutesAgo == null || !Number.isFinite(minutesAgo)) {
    return 0.35;
  }
  if (minutesAgo < 30) {
    return 0.9;
  }
  return 0.65;
}

/**
 * Estimates available stalls from capacity and observed busyness.
 * @param {number} totalStalls
 * @param {"quiet"|"moderate"|"busy"} timePattern
 * @returns {number}
 */
export function estimateAvailable(totalStalls, timePattern) {
  const stalls = Number.isFinite(totalStalls) ? totalStalls : 0;
  const occupancyByPattern = {
    quiet: 0.35,
    moderate: 0.6,
    busy: 0.85
  };
  const occupancy = occupancyByPattern[timePattern] ?? occupancyByPattern.moderate;
  return Math.max(0, Math.round(stalls * (1 - occupancy)));
}

/**
 * Derives a time pattern from estimated occupancy.
 * @param {number} estimatedAvailable
 * @param {number} totalStalls
 * @returns {"quiet"|"moderate"|"busy"}
 */
export function deriveTimePattern(estimatedAvailable, totalStalls) {
  if (!totalStalls || totalStalls <= 0) {
    return "moderate";
  }
  const occupancy = 1 - estimatedAvailable / totalStalls;
  if (occupancy < 0.45) {
    return "quiet";
  }
  if (occupancy < 0.75) {
    return "moderate";
  }
  return "busy";
}

/**
 * Creates confidence and freshness fields from report timing.
 * @param {number|null} lastReportedMinutesAgo
 * @returns {{ confidence: number, isEstimate: boolean, freshnessLabel: "Live"|"Estimated"|string }}
 */
export function buildQualityFields(lastReportedMinutesAgo) {
  const confidence = clamp(computeConfidence(lastReportedMinutesAgo), 0, 1);
  const freshnessLabel = toFreshnessLabel(lastReportedMinutesAgo);
  return {
    confidence,
    isEstimate: freshnessLabel !== "Live",
    freshnessLabel
  };
}
