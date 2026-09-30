import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ServicesProvider } from '@/app/ServicesProvider';
import { GeolocationError } from '@/domain/models/GeolocationError';
import type { GeolocationService } from '@/domain/services/GeolocationService';
import { createDeferredGeolocationService, SAO_PAULO } from '@/test/fakes';
import { useGeolocationViewModel } from './useGeolocationViewModel';

function setup(service: GeolocationService) {
  const overrides = { geolocationService: service };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ServicesProvider overrides={overrides}>{children}</ServicesProvider>
  );
  return renderHook(() => useGeolocationViewModel(), { wrapper });
}

describe('useGeolocationViewModel', () => {
  it('começa ocioso, sem posição nem erro', () => {
    const { result } = setup(createDeferredGeolocationService().service);

    expect(result.current.position).toBeNull();
    expect(result.current.details).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.buttonLabel).toBe('Obter minha localização');
  });

  it('expõe loading e depois a posição formatada', async () => {
    const fake = createDeferredGeolocationService();
    const { result } = setup(fake.service);

    act(() => result.current.requestLocation());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.buttonLabel).toBe('Buscando localização…');

    await act(async () => fake.resolve(SAO_PAULO));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.position).toEqual(SAO_PAULO);
    expect(result.current.details).toContainEqual({ label: 'Latitude', value: '-23,550520' });
    expect(result.current.details).toContainEqual({ label: 'Precisão', value: '± 12,4 m' });
    expect(result.current.mapsUrl).toContain('query=-23.55052,-46.633308');
    expect(result.current.buttonLabel).toBe('Atualizar localização');
  });

  it('expõe a mensagem de erro do domínio', async () => {
    const fake = createDeferredGeolocationService();
    const { result } = setup(fake.service);

    act(() => result.current.requestLocation());
    await act(async () => fake.reject(new GeolocationError('PERMISSION_DENIED')));

    expect(result.current.errorMessage).toMatch(/Permissão negada/);
    expect(result.current.isLoading).toBe(false);
  });

  it('mantém a última posição conhecida quando uma nova busca falha', async () => {
    const fake = createDeferredGeolocationService();
    const { result } = setup(fake.service);

    act(() => result.current.requestLocation());
    await act(async () => fake.resolve(SAO_PAULO));
    act(() => result.current.requestLocation());
    await act(async () => fake.reject(new GeolocationError('TIMEOUT')));

    expect(result.current.position).toEqual(SAO_PAULO);
    expect(result.current.errorMessage).toMatch(/demorou/);
  });

  it('converte erros desconhecidos em mensagem genérica', async () => {
    const fake = createDeferredGeolocationService();
    const { result } = setup(fake.service);

    act(() => result.current.requestLocation());
    await act(async () => fake.reject(new Error('boom')));

    expect(result.current.errorMessage).toBe(
      'Ocorreu um erro inesperado ao obter a localização.',
    );
  });

  it('ignora respostas de requisições canceladas pelo reset', async () => {
    const fake = createDeferredGeolocationService();
    const { result } = setup(fake.service);

    act(() => result.current.requestLocation());
    act(() => result.current.reset());
    await act(async () => fake.resolve(SAO_PAULO));

    expect(result.current.position).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
