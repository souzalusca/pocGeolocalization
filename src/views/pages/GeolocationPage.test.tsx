import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ServicesProvider } from '@/app/ServicesProvider';
import { GeolocationError } from '@/domain/models/GeolocationError';
import { createDeferredGeolocationService, SAO_PAULO } from '@/test/fakes';
import { GeolocationPage } from './GeolocationPage';

// Leaflet depende de APIs de layout que o jsdom não implementa; testamos o mapa isoladamente no navegador.
vi.mock('@/views/components/LocationMap', () => ({
  LocationMap: ({ position }: { position: { latitude: number; longitude: number } }) => (
    <div data-testid="map">
      {position.latitude},{position.longitude}
    </div>
  ),
}));

function renderPage() {
  const fake = createDeferredGeolocationService();
  const overrides = { geolocationService: fake.service };
  render(
    <ServicesProvider overrides={overrides}>
      <GeolocationPage />
    </ServicesProvider>,
  );
  return fake;
}

describe('<GeolocationPage />', () => {
  it('busca a localização ao clicar, exibe os dados e o mapa', async () => {
    const user = userEvent.setup();
    const fake = renderPage();

    expect(screen.queryByTestId('map')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Obter minha localização' }));
    expect(screen.getByRole('button', { name: /Buscando/ })).toBeDisabled();

    fake.resolve(SAO_PAULO);

    expect(await screen.findByText('-23,550520')).toBeInTheDocument();
    expect(screen.getByText('-46,633308')).toBeInTheDocument();
    expect(await screen.findByTestId('map')).toHaveTextContent('-23.55052,-46.633308');
    expect(screen.getByRole('link', { name: /Google Maps/ })).toHaveAttribute(
      'href',
      expect.stringContaining('-23.55052,-46.633308'),
    );
  });

  it('mostra um alerta acessível quando a permissão é negada', async () => {
    const user = userEvent.setup();
    const fake = renderPage();

    await user.click(screen.getByRole('button', { name: 'Obter minha localização' }));
    fake.reject(new GeolocationError('PERMISSION_DENIED'));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Permissão negada/);
    expect(screen.queryByTestId('map')).not.toBeInTheDocument();
  });

  it('limpa a localização ao clicar em "Limpar"', async () => {
    const user = userEvent.setup();
    const fake = renderPage();

    await user.click(screen.getByRole('button', { name: 'Obter minha localização' }));
    fake.resolve(SAO_PAULO);
    await user.click(await screen.findByRole('button', { name: 'Limpar' }));

    expect(screen.queryByTestId('map')).not.toBeInTheDocument();
    expect(screen.getByText(/Nenhuma localização capturada/)).toBeInTheDocument();
  });
});
