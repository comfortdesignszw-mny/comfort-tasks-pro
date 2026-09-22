// Geolocation matching and proximity utilities

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

// Approximate coordinate centers for key neighborhoods to enable proximity matching
export const HOOD_COORDINATES: Record<string, GeoCoordinates> = {
  'Avondale': { latitude: -17.7983, longitude: 31.0366 },
  'Borrowdale': { latitude: -17.7554, longitude: 31.0967 },
  'CBD / Central': { latitude: -17.8292, longitude: 31.0522 },
  'Belgravia': { latitude: -17.7944, longitude: 31.0503 },
  'Eastlea': { latitude: -17.8286, longitude: 31.0827 },
  'Mount Pleasant': { latitude: -17.7686, longitude: 31.0427 },
  'Highlands': { latitude: -17.8042, longitude: 31.1011 },
  'Avenues': { latitude: -17.8189, longitude: 31.0494 },
  'Mabelreign': { latitude: -17.7833, longitude: 30.9833 },
  'Greendale': { latitude: -17.8208, longitude: 31.1278 },
  'Westgate': { latitude: -17.7603, longitude: 30.9639 },
  'Braeside': { latitude: -17.8472, longitude: 31.0667 },
  'Waterfalls': { latitude: -17.8931, longitude: 31.0347 },
  'Chitungwiza': { latitude: -18.0125, longitude: 31.0756 },
  'Downtown': { latitude: 40.7128, longitude: -74.0060 },
  'Midtown': { latitude: 40.7549, longitude: -73.9840 },
  'Brooklyn': { latitude: 40.6782, longitude: -73.9442 },
  'Queens': { latitude: 40.7282, longitude: -73.7949 },
};

/**
 * Calculates distance between two points on Earth using the Haversine formula (in kilometers)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 1 decimal place
}

/**
 * Finds the closest known neighborhood to given coordinates
 */
export function findClosestHood(
  coords: GeoCoordinates
): { hood: string; distanceKm: number } | null {
  let closestHood: string | null = null;
  let minDistance = Infinity;

  for (const [hood, hoodCoords] of Object.entries(HOOD_COORDINATES)) {
    const dist = calculateDistanceKm(
      coords.latitude,
      coords.longitude,
      hoodCoords.latitude,
      hoodCoords.longitude
    );
    if (dist < minDistance) {
      minDistance = dist;
      closestHood = hood;
    }
  }

  if (closestHood) {
    return { hood: closestHood, distanceKm: minDistance };
  }
  return null;
}

/**
 * Requests browser geolocation position
 */
export function getUserCurrentPosition(): Promise<GeoCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
