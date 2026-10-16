export interface Location {
  label: string;
  city?: string;
  country?: string;
  address?: string;
  lat?: number;
  lng?: number;
  isRemote: boolean;
}
