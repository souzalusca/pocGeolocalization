import {
  DEFAULT_GEO_REQUEST_OPTIONS,
  type GeoPosition,
  type GeoRequestOptions,
} from '@/domain/models/GeoPosition';
import { GeolocationError, type GeolocationErrorCode } from '@/domain/models/GeolocationError';
import type { GeolocationService } from '@/domain/services/GeolocationService';

// Códigos definidos pela especificação W3C (GeolocationPositionError).
const BROWSER_ERROR_CODES: Record<number, GeolocationErrorCode> = {
  1: 'PERMISSION_DENIED',
  2: 'POSITION_UNAVAILABLE',
  3: 'TIMEOUT',
};

export function mapBrowserPosition(position: GeolocationPosition): GeoPosition {
  const { coords, timestamp } = position;
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    altitude: coords.altitude,
    altitudeAccuracy: coords.altitudeAccuracy,
    heading: Number.isNaN(coords.heading) ? null : coords.heading,
    speed: coords.speed,
    timestamp,
  };
}

export function mapBrowserError(error: GeolocationPositionError): GeolocationError {
  return new GeolocationError(BROWSER_ERROR_CODES[error.code] ?? 'UNKNOWN');
}

interface BrowserGeolocationDeps {
  /** `undefined` usa `navigator.geolocation`; `null` simula navegador sem suporte. */
  geolocation?: Geolocation | null;
  isSecureContext?: boolean;
}

function resolveBrowserGeolocation(): Geolocation | null {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator
    ? navigator.geolocation
    : null;
}

/** Implementação concreta usando a Geolocation API do navegador. */
export class BrowserGeolocationService implements GeolocationService {
  private readonly geolocation: Geolocation | null;
  private readonly isSecureContext: boolean;

  constructor(deps: BrowserGeolocationDeps = {}) {
    this.geolocation =
      deps.geolocation === undefined ? resolveBrowserGeolocation() : deps.geolocation;
    this.isSecureContext =
      deps.isSecureContext ?? (typeof window !== 'undefined' ? window.isSecureContext : true);
  }

  getCurrentPosition(options: GeoRequestOptions = {}): Promise<GeoPosition> {
    if (!this.isSecureContext) {
      return Promise.reject(new GeolocationError('INSECURE_CONTEXT'));
    }
    if (!this.geolocation) {
      return Promise.reject(new GeolocationError('UNSUPPORTED'));
    }

    const opts = { ...DEFAULT_GEO_REQUEST_OPTIONS, ...options };
    const geolocation = this.geolocation;

    return new Promise<GeoPosition>((resolve, reject) => {
      geolocation.getCurrentPosition(
        (position) => resolve(mapBrowserPosition(position)),
        (error) => reject(mapBrowserError(error)),
        {
          enableHighAccuracy: opts.enableHighAccuracy,
          timeout: opts.timeoutMs,
          maximumAge: opts.maximumAgeMs,
        },
      );
    });
  }
}
