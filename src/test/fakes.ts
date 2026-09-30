import type { GeoPosition } from '@/domain/models/GeoPosition';
import type { GeolocationService } from '@/domain/services/GeolocationService';

export const SAO_PAULO: GeoPosition = {
  latitude: -23.55052,
  longitude: -46.633308,
  accuracy: 12.4,
  altitude: 760,
  altitudeAccuracy: null,
  heading: null,
  speed: null,
  timestamp: Date.UTC(2026, 8, 30, 15, 0, 0),
};

/** Serviço controlável manualmente: permite resolver/rejeitar em momentos específicos do teste. */
export function createDeferredGeolocationService() {
  let resolveFn: (p: GeoPosition) => void = () => undefined;
  let rejectFn: (e: unknown) => void = () => undefined;

  const service: GeolocationService & { calls: number } = {
    calls: 0,
    getCurrentPosition() {
      service.calls += 1;
      return new Promise<GeoPosition>((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;
      });
    },
  };

  return {
    service,
    resolve: (p: GeoPosition = SAO_PAULO) => resolveFn(p),
    reject: (e: unknown) => rejectFn(e),
  };
}
