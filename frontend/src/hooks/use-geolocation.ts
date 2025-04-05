
'use client';

import { useState, useEffect } from 'react';

type GeolocationData = {
  latitude: string;
  longitude: string;
  loading: boolean;
  error: string | null;
};

export function useGeolocation() {
  const [geolocation, setGeolocation] = useState<GeolocationData>({
    latitude: '',
    longitude: '',
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchGeolocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }
        const data = await response.json();
        
        setGeolocation({
          latitude: data.latitude.toFixed(4),
          longitude: data.longitude.toFixed(4),
          loading: false,
          error: null
        });
      } catch (error) {
        setGeolocation(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch location'
        }));
      }
    };

    fetchGeolocation();
  }, []);

  return geolocation;
}