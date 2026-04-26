import { useCallback, useEffect, useState } from "react";
import { API_CONFIG } from "../constants";

const BASE_LOTS = [
  { lotId: "pp-market-garage", name: "Pike Place Market Garage", lat: 47.6093, lng: -122.3424, category: "garage", pricePerHour: 4.0, totalStalls: 250, estimatedAvailable: 85, confidence: 0.65, isEstimate: true, lastReportedMinutesAgo: null, meterFreeToday: false, timePattern: "busy", freshnessLabel: "Estimated", address: "1531 Western Ave" },
  { lotId: "pacific-place", name: "Pacific Place Parking Garage", lat: 47.6113, lng: -122.3358, category: "garage", pricePerHour: 3.5, totalStalls: 1100, estimatedAvailable: 450, confidence: 0.65, isEstimate: true, lastReportedMinutesAgo: null, meterFreeToday: false, timePattern: "moderate", freshnessLabel: "Estimated", address: "600 Pine St" },
  { lotId: "seattle-center-main", name: "Seattle Center Main Garage", lat: 47.6222, lng: -122.3519, category: "garage", pricePerHour: 2.5, totalStalls: 900, estimatedAvailable: 400, confidence: 0.65, isEstimate: true, lastReportedMinutesAgo: null, meterFreeToday: false, timePattern: "moderate", freshnessLabel: "Estimated", address: "305 Harrison St" },
  { lotId: "cap-hill-marketplace", name: "Broadway Marketplace Garage", lat: 47.6244, lng: -122.319, category: "garage", pricePerHour: 2.5, totalStalls: 220, estimatedAvailable: 90, confidence: 0.65, isEstimate: true, lastReportedMinutesAgo: null, meterFreeToday: false, timePattern: "moderate", freshnessLabel: "Estimated", address: "600 Broadway E" },
  { lotId: "sodo-1stave-lot", name: "1st Ave S Event Lot (SoDo)", lat: 47.5945, lng: -122.3319, category: "lot", pricePerHour: 3.0, totalStalls: 500, estimatedAvailable: 350, confidence: 0.65, isEstimate: true, lastReportedMinutesAgo: null, meterFreeToday: false, timePattern: "quiet", freshnessLabel: "Estimated", address: "1st Ave S & Atlantic St" },
  { lotId: "belltown-2nd-ave", name: "2nd Ave Belltown Lot", lat: 47.6163, lng: -122.3436, category: "lot", pricePerHour: 3.0, totalStalls: 180, estimatedAvailable: 60, confidence: 0.65, isEstimate: true, lastReportedMinutesAgo: null, meterFreeToday: false, timePattern: "busy", freshnessLabel: "Estimated", address: "2nd Ave & Bell St" },
  { lotId: "slu-westlake", name: "Westlake SLU Garage", lat: 47.6282, lng: -122.3398, category: "garage", pricePerHour: 3.5, totalStalls: 600, estimatedAvailable: 280, confidence: 0.65, isEstimate: true, lastReportedMinutesAgo: null, meterFreeToday: false, timePattern: "moderate", freshnessLabel: "Estimated", address: "400 Westlake Ave N" },
  { lotId: "pioneer-square-1st", name: "Pioneer Square 1st Ave Lot", lat: 47.6012, lng: -122.3341, category: "lot", pricePerHour: 2.0, totalStalls: 300, estimatedAvailable: 180, confidence: 0.65, isEstimate: true, lastReportedMinutesAgo: null, meterFreeToday: false, timePattern: "quiet", freshnessLabel: "Estimated", address: "1st Ave & Yesler Way" },
  { lotId: "waterfront-pier57", name: "Waterfront Pier 57 Lot", lat: 47.605, lng: -122.3408, category: "lot", pricePerHour: 4.0, totalStalls: 200, estimatedAvailable: 50, confidence: 0.65, isEstimate: true, lastReportedMinutesAgo: null, meterFreeToday: false, timePattern: "busy", freshnessLabel: "Estimated", address: "1301 Alaskan Way" },
  { lotId: "udistrict-udub-lot", name: "UW Triangle Parking Garage", lat: 47.6553, lng: -122.3035, category: "garage", pricePerHour: 2.5, totalStalls: 800, estimatedAvailable: 320, confidence: 0.65, isEstimate: true, lastReportedMinutesAgo: null, meterFreeToday: false, timePattern: "moderate", freshnessLabel: "Estimated", address: "NE 41st St & 15th Ave NE" },
  { lotId: "fremont-34thst", name: "Fremont 34th St Lot", lat: 47.6502, lng: -122.3497, category: "lot", pricePerHour: 0, totalStalls: 80, estimatedAvailable: 40, confidence: 0.6, isEstimate: true, lastReportedMinutesAgo: null, meterFreeToday: true, timePattern: "quiet", freshnessLabel: "Estimated", address: "34th St & Fremont Ave N" },
  { lotId: "firsthill-minor-ave", name: "First Hill Minor Ave Garage", lat: 47.6092, lng: -122.3213, category: "garage", pricePerHour: 3.0, totalStalls: 400, estimatedAvailable: 150, confidence: 0.65, isEstimate: true, lastReportedMinutesAgo: null, meterFreeToday: false, timePattern: "moderate", freshnessLabel: "Estimated", address: "Minor Ave & Spring St" },
  { lotId: "tmbile-park-lot", name: "T-Mobile Park Event Lot", lat: 47.5913, lng: -122.3325, category: "lot", pricePerHour: 5.0, totalStalls: 700, estimatedAvailable: 300, confidence: 0.65, isEstimate: true, lastReportedMinutesAgo: null, meterFreeToday: false, timePattern: "moderate", freshnessLabel: "Estimated", address: "1250 1st Ave S" },
  { lotId: "downtown-4th-columbia", name: "4th & Columbia Garage", lat: 47.6044, lng: -122.3296, category: "garage", pricePerHour: 4.0, totalStalls: 850, estimatedAvailable: 200, confidence: 0.65, isEstimate: true, lastReportedMinutesAgo: null, meterFreeToday: false, timePattern: "busy", freshnessLabel: "Estimated", address: "800 4th Ave" },
  { lotId: "cap-hill-summit", name: "Summit Ave Cap Hill Street", lat: 47.6219, lng: -122.3208, category: "metered", pricePerHour: 2.0, totalStalls: 60, estimatedAvailable: 25, confidence: 0.6, isEstimate: true, lastReportedMinutesAgo: null, meterFreeToday: false, timePattern: "moderate", freshnessLabel: "Estimated", address: "Summit Ave E & Pine St" },
];

function isMeterFreeToday() {
  const day = new Date().getDay();
  if (day === 0) return true;
  const holidays = ["01-01", "07-04", "12-25"];
  const md = `${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
  return holidays.includes(md);
}

function applyFreeToday(lots) {
  const free = isMeterFreeToday();
  return lots.map((l) => ({ ...l, meterFreeToday: l.category === "free" ? true : free }));
}

export function useAvailability() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState("backend");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${API_CONFIG.baseUrl}/api/v1/parking/lots`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLots(applyFreeToday(data));
        setSource("backend");
        return;
      }
      throw new Error("Empty response");
    } catch (err) {
      clearTimeout(timer);
      console.warn("[useAvailability] Backend unreachable, using fallback:", err.message);
      setLots(applyFreeToday(BASE_LOTS));
      setSource("fallback");
    } finally {
      setLoading(false);
    }
  }, []);

  // Crowdsource report: updates this lot's confidence and estimated count in-state
  const submitReport = useCallback((lotId, type) => {
    setLots((prev) =>
      prev.map((lot) => {
        if (lot.lotId !== lotId) return lot;
        const reportCount = (lot.reportCount || 0) + 1;
        let confidence = lot.confidence ?? 0.65;
        let estimatedAvailable = lot.estimatedAvailable ?? 0;
        if (type === "available") {
          confidence = Math.min(0.97, confidence + 0.08);
          estimatedAvailable = Math.min(lot.totalStalls, estimatedAvailable + Math.ceil(lot.totalStalls * 0.05));
        } else {
          confidence = Math.min(0.97, confidence + 0.06);
          estimatedAvailable = Math.max(0, estimatedAvailable - Math.ceil(lot.totalStalls * 0.08));
        }
        return {
          ...lot,
          confidence,
          estimatedAvailable,
          reportCount,
          freshnessLabel: `${reportCount} community report${reportCount === 1 ? "" : "s"}`,
          lastReportedMinutesAgo: 0,
        };
      })
    );
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { lots, loading, error, source, refresh, submitReport };
}
