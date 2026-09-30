import { lazy, Suspense } from 'react';
import { useGeolocationViewModel } from '@/viewmodels/useGeolocationViewModel';
import { ErrorAlert } from '@/views/components/ErrorAlert';
import { LocationButton } from '@/views/components/LocationButton';
import { LocationDetails } from '@/views/components/LocationDetails';

// Leaflet só é carregado quando existe uma posição para mostrar.
const LocationMap = lazy(() =>
  import('@/views/components/LocationMap').then((m) => ({ default: m.LocationMap })),
);

export function GeolocationPage() {
  const vm = useGeolocationViewModel();

  return (
    <main className="page">
      <header className="page__header">
        <h1>Geolocalização</h1>
        <p className="page__subtitle">
          Capture a posição atual do dispositivo e veja onde ela caiu no mapa.
        </p>
      </header>

      <div className="actions">
        <LocationButton
          label={vm.buttonLabel}
          isLoading={vm.isLoading}
          onClick={vm.requestLocation}
        />
        {vm.position && !vm.isLoading && (
          <button type="button" className="btn btn--ghost" onClick={vm.reset}>
            Limpar
          </button>
        )}
      </div>

      <div aria-live="polite">{vm.errorMessage && <ErrorAlert message={vm.errorMessage} />}</div>

      <LocationDetails items={vm.details} mapsUrl={vm.mapsUrl} />

      {vm.position && (
        <Suspense fallback={<div className="card map-card map-card--loading">Carregando mapa…</div>}>
          <LocationMap position={vm.position} />
        </Suspense>
      )}
    </main>
  );
}
