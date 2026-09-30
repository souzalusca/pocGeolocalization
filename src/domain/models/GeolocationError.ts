export type GeolocationErrorCode =
  | 'UNSUPPORTED'
  | 'INSECURE_CONTEXT'
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'UNKNOWN';

const USER_MESSAGES: Record<GeolocationErrorCode, string> = {
  UNSUPPORTED: 'Seu navegador não suporta geolocalização.',
  INSECURE_CONTEXT: 'A geolocalização só funciona em HTTPS ou localhost.',
  PERMISSION_DENIED:
    'Permissão negada. Libere o acesso à localização nas configurações do navegador e tente novamente.',
  POSITION_UNAVAILABLE: 'Não foi possível determinar sua localização no momento.',
  TIMEOUT: 'A busca pela localização demorou demais. Tente novamente.',
  UNKNOWN: 'Ocorreu um erro inesperado ao obter a localização.',
};

/** Erro de domínio: carrega um código estável e uma mensagem pronta para o usuário. */
export class GeolocationError extends Error {
  readonly code: GeolocationErrorCode;

  constructor(code: GeolocationErrorCode, message: string = USER_MESSAGES[code]) {
    super(message);
    this.name = 'GeolocationError';
    this.code = code;
  }

  static from(error: unknown): GeolocationError {
    if (error instanceof GeolocationError) return error;
    return new GeolocationError('UNKNOWN');
  }
}
