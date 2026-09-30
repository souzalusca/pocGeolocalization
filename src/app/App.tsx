import { ServicesProvider } from '@/app/ServicesProvider';
import { GeolocationPage } from '@/views/pages/GeolocationPage';

export function App() {
  return (
    <ServicesProvider>
      <GeolocationPage />
    </ServicesProvider>
  );
}
