import { createContext, useContext } from 'react';
import type { GeolocationService } from '@/domain/services/GeolocationService';

export interface Services {
  geolocationService: GeolocationService;
}

export const ServicesContext = createContext<Services | null>(null);

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error('useServices deve ser usado dentro de <ServicesProvider>.');
  }
  return services;
}
