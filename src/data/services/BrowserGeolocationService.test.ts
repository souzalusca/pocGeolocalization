import { describe, expect, it, vi } from 'vitest';
import { GeolocationError } from '@/domain/models/GeolocationError';
import { BrowserGeolocationService } from './BrowserGeolocationService';

function makeBrowserPosition(): GeolocationPosition {
  return {
    coords: {
      latitude: -23.5,
      longitude: -46.6,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: Number.NaN,
      speed: null,
      toJSON: () => ({}),
    },
    timestamp: 1_000,
    toJSON: () => ({}),
  } as GeolocationPosition;
}

function makeGeolocation(
  impl: Geolocation['getCurrentPosition'],
): Geolocation {
  return {
    getCurrentPosition: vi.fn(impl),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  } as unknown as Geolocation;
}

describe('BrowserGeolocationService', () => {
  it('mapeia a posição do navegador para o modelo de domínio', async () => {
    const geolocation = makeGeolocation((success) => success(makeBrowserPosition()));
    const service = new BrowserGeolocationService({ geolocation, isSecureContext: true });

    await expect(service.getCurrentPosition()).resolves.toEqual({
      latitude: -23.5,
      longitude: -46.6,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null, // NaN normalizado para null
      speed: null,
      timestamp: 1_000,
    });
  });

  it('repassa as opções convertidas para a API do navegador', async () => {
    const geolocation = makeGeolocation((success) => success(makeBrowserPosition()));
    const service = new BrowserGeolocationService({ geolocation, isSecureContext: true });

    await service.getCurrentPosition({ timeoutMs: 5_000, enableHighAccuracy: false });

    expect(geolocation.getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: false, timeout: 5_000, maximumAge: 0 },
    );
  });

  it.each([
    [1, 'PERMISSION_DENIED'],
    [2, 'POSITION_UNAVAILABLE'],
    [3, 'TIMEOUT'],
    [99, 'UNKNOWN'],
  ] as const)('converte o código de erro %i em %s', async (code, expected) => {
    const geolocation = makeGeolocation((_s, error) =>
      error?.({ code, message: '' } as GeolocationPositionError),
    );
    const service = new BrowserGeolocationService({ geolocation, isSecureContext: true });

    await expect(service.getCurrentPosition()).rejects.toMatchObject({ code: expected });
  });

  it('rejeita quando a API não existe', async () => {
    const service = new BrowserGeolocationService({ geolocation: null, isSecureContext: true });

    await expect(service.getCurrentPosition()).rejects.toEqual(
      new GeolocationError('UNSUPPORTED'),
    );
  });

  it('rejeita fora de contexto seguro (HTTP)', async () => {
    const geolocation = makeGeolocation(() => undefined);
    const service = new BrowserGeolocationService({ geolocation, isSecureContext: false });

    await expect(service.getCurrentPosition()).rejects.toMatchObject({ code: 'INSECURE_CONTEXT' });
    expect(geolocation.getCurrentPosition).not.toHaveBeenCalled();
  });
});
