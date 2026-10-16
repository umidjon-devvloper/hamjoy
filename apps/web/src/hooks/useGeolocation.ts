'use client';

import { useCallback, useState } from 'react';
import type { MapCoordinates } from '@/types';

export type GeolocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unsupported';

export function useGeolocation() {
  const [coords, setCoords] = useState<MapCoordinates | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unsupported');
      setError("Brauzer geolokatsiyani qo'llab-quvvatlamaydi");
      return;
    }
    setStatus('loading');
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('granted');
      },
      (err) => {
        setStatus('denied');
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Joylashuvga ruxsat berilmadi. Brauzer sozlamalaridan yoqing."
            : "Joylashuvni aniqlab bo'lmadi."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { coords, status, error, request, setCoords };
}
