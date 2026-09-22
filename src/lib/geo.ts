// Geolocation matching and proximity utilities

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

// Approximate coordinate centers for cities and key neighborhoods in Zimbabwe
export const HOOD_COORDINATES: Record<string, GeoCoordinates> = {
  // Major Cities Centers
  'Harare': { latitude: -17.8292, longitude: 31.0522 },
  'Bulawayo': { latitude: -20.1554, longitude: 28.5833 },
  'Chitungwiza': { latitude: -18.0125, longitude: 31.0756 },
  'Mutare': { latitude: -18.9728, longitude: 32.6695 },
  'Gweru': { latitude: -19.4589, longitude: 29.8149 },
  'Masvingo': { latitude: -20.0744, longitude: 30.8277 },
  'Kwekwe': { latitude: -18.9281, longitude: 29.8149 },
  'Kadoma': { latitude: -18.3333, longitude: 29.9167 },
  'Victoria Falls': { latitude: -17.9318, longitude: 25.8404 },
  'Marondera': { latitude: -18.1853, longitude: 31.5519 },
  'Chinhoyi': { latitude: -17.3667, longitude: 30.2000 },
  'Zvishavane': { latitude: -20.3333, longitude: 30.0667 },
  'Bindura': { latitude: -17.3000, longitude: 31.3333 },
  'Hwange': { latitude: -18.3647, longitude: 26.5028 },
  'Beitbridge': { latitude: -22.2167, longitude: 30.0000 },
  'Kariba': { latitude: -16.5167, longitude: 28.8000 },
  'Rusape': { latitude: -17.0000, longitude: 32.1167 },
  'Chegutu': { latitude: -18.1303, longitude: 30.1408 },
  'Shurugwi': { latitude: -19.6706, longitude: 29.9972 },
  'Gwanda': { latitude: -20.9333, longitude: 29.0000 },
  'Norton': { latitude: -17.8833, longitude: 30.7000 },
  'Ruwa': { latitude: -17.8897, longitude: 31.2447 },

  // Harare Neighborhoods
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
  'Hatfield': { latitude: -17.8833, longitude: 31.0833 },
  'Kuwadzana': { latitude: -17.8333, longitude: 30.9167 },
  'Glen View': { latitude: -17.8833, longitude: 30.9500 },
  'Warren Park': { latitude: -17.8361, longitude: 30.9833 },
  'Mabvuku': { latitude: -17.8500, longitude: 31.1833 },
  'Tafara': { latitude: -17.8333, longitude: 31.2000 },
  'Highfield': { latitude: -17.8833, longitude: 30.9833 },
  'Southerton': { latitude: -17.8583, longitude: 31.0250 },
  'Msasa': { latitude: -17.8389, longitude: 31.1167 },
  'Newlands': { latitude: -17.8083, longitude: 31.0806 },
  'Vainona': { latitude: -17.7556, longitude: 31.0694 },
  'Glen Lorne': { latitude: -17.7333, longitude: 31.1500 },
  'Chisipite': { latitude: -17.7778, longitude: 31.1167 },
  'Marlborough': { latitude: -17.7472, longitude: 30.9861 },

  // Bulawayo Neighborhoods
  'Kumalo': { latitude: -20.1417, longitude: 28.6083 },
  'Hillside': { latitude: -20.1833, longitude: 28.6000 },
  'Suburbs': { latitude: -20.1583, longitude: 28.6000 },
  'Bradfield': { latitude: -20.1750, longitude: 28.5917 },
  'Matsheumhlope': { latitude: -20.1833, longitude: 28.6333 },
  'Burnside': { latitude: -20.2000, longitude: 28.6167 },
  'Ascot': { latitude: -20.1667, longitude: 28.6167 },
  'Cowdray Park': { latitude: -20.0833, longitude: 28.4833 },
  'Nkulumane': { latitude: -20.1833, longitude: 28.5167 },
  'Luveve': { latitude: -20.1167, longitude: 28.5000 },
  'Magwegwe': { latitude: -20.1333, longitude: 28.4833 },
  'Pumula': { latitude: -20.1500, longitude: 28.4500 },

  // Mutare Neighborhoods
  'Murambi': { latitude: -18.9500, longitude: 32.6667 },
  'Chikanga': { latitude: -18.9833, longitude: 32.6167 },
  'Dangamvura': { latitude: -19.0167, longitude: 32.6333 },
  'Morningside': { latitude: -18.9667, longitude: 32.6500 },

  // Gweru Neighborhoods
  'Mkoba': { latitude: -19.4500, longitude: 29.7500 },
  'Southdowns': { latitude: -19.4833, longitude: 29.8167 },
  'Lundi Park': { latitude: -19.4667, longitude: 29.8333 },

  // Masvingo Neighborhoods
  'Mucheke': { latitude: -20.0833, longitude: 30.8167 },
  'Rujeko': { latitude: -20.0917, longitude: 30.8333 },
  'Rhodene': { latitude: -20.0500, longitude: 30.8333 },

  // Other Global / Fallbacks
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
 * Finds the closest known neighborhood or city to given coordinates
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
 * Asynchronously attempts reverse geocoding via OpenStreetMap Nominatim with a fast timeout
 */
export async function reverseGeocode(coords: GeoCoordinates): Promise<{
  city?: string;
  suburb?: string;
  county?: string;
  country?: string;
  displayName?: string;
} | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    const address = data.address || {};
    const suburb = address.suburb || address.neighbourhood || address.residential || address.subdivision;
    const city = address.city || address.town || address.municipality || address.county || address.state_district;
    return {
      suburb,
      city,
      county: address.county,
      country: address.country,
      displayName: data.display_name,
    };
  } catch {
    return null;
  }
}

export interface DetectedLocationResult {
  locationName: string;
  city?: string;
  suburb?: string;
  distanceKm?: number;
  coords: GeoCoordinates;
  source: 'gps_reverse_geocode' | 'gps_nearest_hood';
}

/**
 * Comprehensive auto-detection of the current user location:
 * Obtains browser GPS, performs reverse geocoding if available,
 * and always guarantees matching with the closest major city/neighborhood.
 */
export async function autoDetectLocation(): Promise<DetectedLocationResult> {
  const coords = await getUserCurrentPosition();
  const closest = findClosestHood(coords);

  // Try reverse geocoding in parallel or with quick timeout
  let detectedCity: string | undefined;
  let detectedSuburb: string | undefined;

  try {
    const reverse = await reverseGeocode(coords);
    if (reverse) {
      detectedCity = reverse.city;
      detectedSuburb = reverse.suburb;
    }
  } catch {
    // ignore network errors
  }

  // Format the most appropriate location string
  let locationName: string;
  let source: 'gps_reverse_geocode' | 'gps_nearest_hood' = 'gps_nearest_hood';

  if (detectedSuburb && detectedCity) {
    locationName = `${detectedSuburb}, ${detectedCity}`;
    source = 'gps_reverse_geocode';
  } else if (detectedSuburb) {
    locationName = detectedSuburb;
    source = 'gps_reverse_geocode';
  } else if (detectedCity) {
    locationName = detectedCity;
    source = 'gps_reverse_geocode';
  } else if (closest) {
    locationName = closest.hood;
  } else {
    locationName = 'Harare';
  }

  return {
    locationName,
    city: detectedCity,
    suburb: detectedSuburb,
    distanceKm: closest?.distanceKm,
    coords,
    source,
  };
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
