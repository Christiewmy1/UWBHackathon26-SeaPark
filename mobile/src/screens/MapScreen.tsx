import React, { useEffect, useState } from "react";
import { View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { getParkingLots } from "../services/api";

export default function MapScreen() {
  const [lots, setLots] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getParkingLots();
    setLots(data);
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 47.6062,
          longitude: -122.3321,
          latitudeDelta: 0.09,
          longitudeDelta: 0.09,
        }}
      >
        {lots.map((lot) => (
          <Marker
            key={lot.id}
            coordinate={{
              latitude: lot.lat,
              longitude: lot.lng,
            }}
            pinColor={
              lot.availability > 0.7
                ? "green"
                : lot.availability > 0.3
                ? "orange"
                : "red"
            }
            title={lot.name}
            description={`Confidence: ${lot.confidence}`}
          />
        ))}
      </MapView>
    </View>
  );
}