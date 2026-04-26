import React, { useState } from "react";
import MapScreen from "./src/screens/MapScreen";
import SpotDetailsScreen from "./src/screens/SpotDetailsScreen";
import AIConciergeScreen from "./src/screens/AIConciergeScreen";
import { useAvailability } from "./src/hooks/useAvailability";

type ActiveScreen =
  | { name: "Map" }
  | { name: "SpotDetails"; lotId: string }
  | { name: "AIConcierge" };

export default function App() {
  const [screen, setScreen] = useState<ActiveScreen>({ name: "Map" });
  const { lots, loading, error, refresh, submitReport } = useAvailability();

  if (screen.name === "SpotDetails") {
    const lot = lots.find((l: any) => l.lotId === screen.lotId) ?? null;
    if (!lot) return null;
    return (
      <SpotDetailsScreen
        lot={lot}
        onBack={() => setScreen({ name: "Map" })}
        onReport={(lotId, type) => submitReport(lotId, type)}
      />
    );
  }

  if (screen.name === "AIConcierge") {
    return (
      <AIConciergeScreen
        onBack={() => setScreen({ name: "Map" })}
        onSelectLot={(lot) => setScreen({ name: "SpotDetails", lotId: lot.lotId })}
      />
    );
  }

  return (
    <MapScreen
      lots={lots}
      loading={loading}
      error={error}
      refresh={refresh}
      onSelectLot={(lot) => setScreen({ name: "SpotDetails", lotId: lot.lotId })}
      onOpenAI={() => setScreen({ name: "AIConcierge" })}
    />
  );
}
