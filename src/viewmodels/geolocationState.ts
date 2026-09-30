import type { GeoPosition } from '@/domain/models/GeoPosition';
import type { GeolocationError } from '@/domain/models/GeolocationError';

/** Estado da tela modelado como união discriminada: estados impossíveis não compilam. */
export type GeolocationState =
  | { status: 'idle' }
  | { status: 'loading'; previous: GeoPosition | null }
  | { status: 'success'; position: GeoPosition }
  | { status: 'error'; error: GeolocationError; previous: GeoPosition | null };

export type GeolocationAction =
  | { type: 'REQUEST' }
  | { type: 'RESOLVE'; position: GeoPosition }
  | { type: 'REJECT'; error: GeolocationError }
  | { type: 'RESET' };

export const initialGeolocationState: GeolocationState = { status: 'idle' };

export function lastKnownPosition(state: GeolocationState): GeoPosition | null {
  switch (state.status) {
    case 'success':
      return state.position;
    case 'loading':
    case 'error':
      return state.previous;
    default:
      return null;
  }
}

export function geolocationReducer(
  state: GeolocationState,
  action: GeolocationAction,
): GeolocationState {
  switch (action.type) {
    case 'REQUEST':
      return { status: 'loading', previous: lastKnownPosition(state) };
    case 'RESOLVE':
      return { status: 'success', position: action.position };
    case 'REJECT':
      return { status: 'error', error: action.error, previous: lastKnownPosition(state) };
    case 'RESET':
      return initialGeolocationState;
  }
}
