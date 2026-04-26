import React, { useState, useEffect } from "react";
import { initializeFirebase } from "./src/services/firebase";
import MapScreen from "./src/screens/MapScreen";
import SpotDetailsScreen from "./src/screens/SpotDetailsScreen";
import AIConciergeScreen from "./src/screens/AIConciergeScreen";

type ActiveScreen =
  | { name: "Map" }
  | { name: "SpotDetails"; lotId: string }
  | { name: "AIConcierge" };

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>({ name: "Map" });

  useEffect(() => {
    initializeFirebase();
  }, []);

  if (activeScreen.name === "SpotDetails") {
    return (
      <SpotDetailsScreen
        lotId={activeScreen.lotId}
        onBack={() => setActiveScreen({ name: "Map" })}
      />
    );
  }

  if (activeScreen.name === "AIConcierge") {
    return (
      <AIConciergeScreen
        onBack={() => setActiveScreen({ name: "Map" })}
        onSelectLot={(lotId) => setActiveScreen({ name: "SpotDetails", lotId })}
      />
    );
  }

  return (
    <MapScreen
      onSelectLot={(lotId) => setActiveScreen({ name: "SpotDetails", lotId })}
      onOpenAI={() => setActiveScreen({ name: "AIConcierge" })}
    />
  );
}
