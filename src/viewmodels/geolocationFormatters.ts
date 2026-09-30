import type { GeoPosition } from '@/domain/models/GeoPosition';

export interface DetailItem {
  readonly label: string;
  readonly value: string;
}

const LOCALE = 'pt-BR';

const coordFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 6,
  maximumFractionDigits: 6,
});

const meterFormatter = new Intl.NumberFormat(LOCALE, {
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: 'short',
  timeStyle: 'medium',
});

const NOT_AVAILABLE = '—';

function orNA(value: number | null, format: (n: number) => string): string {
  return value === null ? NOT_AVAILABLE : format(value);
}

/** Transforma o modelo de domínio em dados prontos para exibição. */
export function toDetailItems(position: GeoPosition): DetailItem[] {
  return [
    { label: 'Latitude', value: coordFormatter.format(position.latitude) },
    { label: 'Longitude', value: coordFormatter.format(position.longitude) },
    { label: 'Precisão', value: `± ${meterFormatter.format(position.accuracy)} m` },
    {
      label: 'Altitude',
      value: orNA(position.altitude, (n) => `${meterFormatter.format(n)} m`),
    },
    {
      label: 'Direção',
      value: orNA(position.heading, (n) => `${meterFormatter.format(n)}°`),
    },
    {
      label: 'Velocidade',
      value: orNA(position.speed, (n) => `${meterFormatter.format(n * 3.6)} km/h`),
    },
    { label: 'Capturado em', value: dateFormatter.format(new Date(position.timestamp)) },
  ];
}

export function toGoogleMapsUrl({ latitude, longitude }: GeoPosition): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}
