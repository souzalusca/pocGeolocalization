import type { DetailItem } from '@/viewmodels/geolocationFormatters';

interface LocationDetailsProps {
  items: readonly DetailItem[];
  mapsUrl: string | null;
}

export function LocationDetails({ items, mapsUrl }: LocationDetailsProps) {
  if (items.length === 0) {
    return (
      <p className="empty-state">
        Nenhuma localização capturada ainda. Clique no botão acima para começar.
      </p>
    );
  }

  return (
    <section className="card" aria-labelledby="details-title">
      <h2 id="details-title" className="card__title">
        Dados capturados
      </h2>
      <dl className="details">
        {items.map(({ label, value }) => (
          <div key={label} className="details__row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {mapsUrl && (
        <a className="link" href={mapsUrl} target="_blank" rel="noopener noreferrer">
          Abrir no Google Maps ↗
        </a>
      )}
    </section>
  );
}
