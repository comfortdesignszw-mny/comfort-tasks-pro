import { useState, useEffect, useCallback } from 'react';
import {
  CustomPlace,
  MAJOR_CITIES,
  ZIMBABWE_CITIES_DATA,
  getCustomPlaces,
  addCustomPlace as addCustomPlaceUtil,
  editCustomPlace as editCustomPlaceUtil,
  deleteCustomPlace as deleteCustomPlaceUtil,
} from '../constants/neighborhoods';
import { autoDetectLocation, DetectedLocationResult } from '../lib/geo';

export function useLocations() {
  const [customPlaces, setCustomPlaces] = useState<CustomPlace[]>(() => getCustomPlaces());
  const [isLocating, setIsLocating] = useState(false);
  const [detectionNotice, setDetectionNotice] = useState<string | null>(null);

  // Sync custom places across components and tabs
  useEffect(() => {
    const handleUpdate = () => {
      setCustomPlaces(getCustomPlaces());
    };

    window.addEventListener('custom-places-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('custom-places-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const addPlace = useCallback((name: string, city?: string) => {
    const created = addCustomPlaceUtil(name, city);
    setCustomPlaces(getCustomPlaces());
    return created;
  }, []);

  const editPlace = useCallback((id: string, name: string, city?: string) => {
    const success = editCustomPlaceUtil(id, name, city);
    if (success) {
      setCustomPlaces(getCustomPlaces());
    }
    return success;
  }, []);

  const deletePlace = useCallback((id: string) => {
    deleteCustomPlaceUtil(id);
    setCustomPlaces(getCustomPlaces());
  }, []);

  const detectUserLocation = useCallback(async (): Promise<DetectedLocationResult | null> => {
    setIsLocating(true);
    setDetectionNotice(null);
    try {
      const result = await autoDetectLocation();
      let notice = `Detected location: ${result.locationName}`;
      if (result.distanceKm !== undefined) {
        notice += ` (~${result.distanceKm} km away)`;
      }
      setDetectionNotice(notice);

      // Save into customer preference in localStorage
      try {
        const cached = localStorage.getItem('comfort_handyman_customer');
        const data = cached ? JSON.parse(cached) : {};
        data.hood = result.locationName;
        data.lat = result.coords.latitude;
        data.lng = result.coords.longitude;
        localStorage.setItem('comfort_handyman_customer', JSON.stringify(data));
      } catch {
        // ignore
      }

      return result;
    } catch (err: any) {
      console.warn('Geolocation detection failed:', err);
      setDetectionNotice('Could not auto-detect location. Please select or add your city/neighborhood.');
      return null;
    } finally {
      setIsLocating(false);
    }
  }, []);

  return {
    majorCities: MAJOR_CITIES,
    citiesData: ZIMBABWE_CITIES_DATA,
    customPlaces,
    addPlace,
    editPlace,
    deletePlace,
    detectUserLocation,
    isLocating,
    detectionNotice,
    setDetectionNotice,
  };
}
