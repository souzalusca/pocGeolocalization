/**
 * Modelo de domínio da posição capturada.
 * Independente da API do navegador, para que o restante da aplicação
 * não conheça detalhes de `GeolocationPosition`.
 */
export interface GeoPosition {
  readonly latitude: number;
  readonly longitude: number;
  /** Raio de precisão em metros. */
  readonly accuracy: number;
  readonly altitude: number | null;
  readonly altitudeAccuracy: number | null;
  /** Direção em graus (0–360), quando o dispositivo está em movimento. */
  readonly heading: number | null;
  /** Velocidade em m/s. */
  readonly speed: number | null;
  /** Epoch em milissegundos. */
  readonly timestamp: number;
}

export interface GeoRequestOptions {
  readonly enableHighAccuracy?: boolean;
  readonly timeoutMs?: number;
  readonly maximumAgeMs?: number;
}

export const DEFAULT_GEO_REQUEST_OPTIONS: Required<GeoRequestOptions> = {
  enableHighAccuracy: true,
  timeoutMs: 10_000,
  maximumAgeMs: 0,
};
