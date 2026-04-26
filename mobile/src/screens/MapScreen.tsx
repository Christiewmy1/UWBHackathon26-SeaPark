import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { MAP_CONFIG, COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from "../constants";

type Props = {
  lots: any[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  onSelectLot: (lot: any) => void;
  onOpenAI: () => void;
};

export default function MapScreen({ lots, loading, error, refresh, onSelectLot, onOpenAI }: Props) {
  const getMarkerColor = (lot: any) => {
    if (lot.category === "free" || lot.meterFreeToday) return "green";
    if (lot.timePattern === "quiet") return "green";
    if (lot.timePattern === "busy") return "red";
    return "orange";
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={MAP_CONFIG.defaultRegion}>
        {lots.map((lot: any) => (
          <Marker
            key={lot.lotId}
            coordinate={{ latitude: lot.lat, longitude: lot.lng }}
            pinColor={getMarkerColor(lot)}
            title={lot.name}
            description={
              lot.meterFreeToday
                ? "Free today!"
                : lot.pricePerHour
                ? `$${lot.pricePerHour}/hr`
                : "Free"
            }
            onCalloutPress={() => onSelectLot(lot)}
          />
        ))}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Seattle parking...</Text>
        </View>
      )}

      {error && !loading && (
        <TouchableOpacity style={styles.errorBanner} onPress={refresh}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSub}>Tap to retry</Text>
        </TouchableOpacity>
      )}

      {!loading && lots.length > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{lots.length} lots</Text>
        </View>
      )}

      <TouchableOpacity style={styles.aiButton} onPress={onOpenAI}>
        <Text style={styles.aiButtonText}>Ask Husky AI</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  errorBanner: {
    position: "absolute",
    top: 48,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: "#92400E",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  errorText: {
    color: "#FEF3C7",
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: "center",
  },
  errorSub: {
    color: "#FDE68A",
    fontSize: TYPOGRAPHY.fontSize.xs,
    textAlign: "center",
    marginTop: 2,
  },
  badge: {
    position: "absolute",
    top: 48,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  aiButton: {
    position: "absolute",
    bottom: 36,
    alignSelf: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING["2xl"],
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  aiButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
