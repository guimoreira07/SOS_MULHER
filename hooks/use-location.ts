import { useState, useCallback } from "react";
import * as Location from "expo-location";

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getLocation = useCallback(async (): Promise<LocationCoords | null> => {
    setLoading(true);
    setError(null);
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permissão de localização negada");
        setLoading(false);
        return null;
      }

      // Get current location
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: LocationCoords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy || undefined,
      };

      setLocation(coords);
      return coords;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Erro ao obter localização";
      setError(errorMsg);
      console.error("Location error:", e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLocationUrl = (coords: LocationCoords): string => {
    return `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
  };

  return { location, error, loading, getLocation, getLocationUrl };
}
