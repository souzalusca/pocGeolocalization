import { useMemo, type ReactNode } from 'react';
import { BrowserGeolocationService } from '@/data/services/BrowserGeolocationService';
import { ServicesContext, type Services } from './ServicesContext';

interface ServicesProviderProps {
  children: ReactNode;
  /** Permite sobrescrever serviços (testes, storybook, mocks). */
  overrides?: Partial<Services>;
}

export function ServicesProvider({ children, overrides }: ServicesProviderProps) {
  const services = useMemo<Services>(
    () => ({
      geolocationService: overrides?.geolocationService ?? new BrowserGeolocationService(),
    }),
    [overrides?.geolocationService],
  );

  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}
