import type { GeoPosition, GeoRequestOptions } from '@/domain/models/GeoPosition';

/**
 * Contrato (porta) do serviço de geolocalização.
 * A ViewModel depende desta interface, nunca da implementação concreta —
 * isso permite trocar a fonte (browser, mock, IP lookup) e testar isoladamente.
 */
export interface GeolocationService {
  getCurrentPosition(options?: GeoRequestOptions): Promise<GeoPosition>;
}
