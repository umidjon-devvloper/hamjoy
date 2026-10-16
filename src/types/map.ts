export type MapProviderId = 'placeholder' | 'google' | 'yandex' | 'leaflet';

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

export interface MapViewport {
  center: MapCoordinates;
  zoom: number;
  bounds: MapBounds;
}

export interface MapMarkerPosition {
  top: string;
  left: string;
}

/** Job marker shown on the map — provider-agnostic data model */
export interface MapMarkerData {
  id: string;
  jobId: string;
  title: string;
  salary: string;
  location: string;
  company: string;
  isRemote: boolean;
  coordinates?: MapCoordinates;
  position: MapMarkerPosition;
  active?: boolean;
}

/** @deprecated Use MapMarkerData — kept for gradual migration */
export interface MapPin {
  id: string;
  top: string;
  left: string;
  label: string;
  jobId: string;
  active?: boolean;
}

export function toLegacyMapPin(marker: MapMarkerData): MapPin {
  return {
    id: marker.id,
    top: marker.position.top,
    left: marker.position.left,
    label: marker.company,
    jobId: marker.jobId,
    active: marker.active,
  };
}
