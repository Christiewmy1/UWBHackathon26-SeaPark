import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { subscribeToParkingLots } from "../services/firebase";
import { MAP_CONFIG, COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from "../constants";
import type { ParkingLot } from "../types";

type Props = {
  onSelectLot: (lotId: string) => void;
  onOpenAI: () => void;
};

export default function MapScreen({ onSelectLot, onOpenAI }: Props) {
  const [lots, setLots] = useState<ParkingLot[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToParkingLots((data) => {
      setLots(data);
    });
    return unsubscribe;
  }, []);

  const getMarkerColor = (availability: string) => {
    if (availability === "high") return "green";
    if (availability === "limited") return "orange";
    return "red";
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={MAP_CONFIG.defaultRegion}>
        {lots.map((lot) => (
          <Marker
            key={lot.id}
            coordinate={{ latitude: lot.latitude, longitude: lot.longitude }}
            pinColor={getMarkerColor(lot.availability)}
            title={lot.name}
            description={lot.isFree ? "Free" : `$${lot.pricePerHour}/hr`}
            onCalloutPress={() => onSelectLot(lot.id)}
          />
        ))}
      </MapView>

      <TouchableOpacity style={styles.aiButton} onPress={onOpenAI}>
        <Text style={styles.aiButtonText}>Ask Husky AI</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  aiButton: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING["2xl"],
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  aiButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
