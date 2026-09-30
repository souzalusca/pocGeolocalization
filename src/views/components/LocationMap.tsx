import { useEffect } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { GeoPosition } from '@/domain/models/GeoPosition';

// Corrige os ícones padrão do Leaflet quando empacotado por bundlers (Vite/Webpack).
const defaultIcon = icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_ZOOM = 16;
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

interface LocationMapProps {
  position: GeoPosition;
}

/** Recentraliza o mapa quando a posição muda (MapContainer só lê `center` na montagem). */
function RecenterOnChange({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), DEFAULT_ZOOM), { duration: 0.8 });
  }, [map, lat, lng]);
  return null;
}

export function LocationMap({ position }: LocationMapProps) {
  const center: [number, number] = [position.latitude, position.longitude];

  return (
    <section className="card map-card" aria-label="Mapa com a localização capturada">
      <MapContainer center={center} zoom={DEFAULT_ZOOM} className="map" scrollWheelZoom>
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <Circle
          center={center}
          radius={position.accuracy}
          pathOptions={{ color: '#2563eb', fillOpacity: 0.12, weight: 1 }}
        />
        <Marker position={center} icon={defaultIcon}>
          <Popup>
            Você está aqui
            <br />
            Precisão: ± {Math.round(position.accuracy)} m
          </Popup>
        </Marker>
        <RecenterOnChange lat={position.latitude} lng={position.longitude} />
      </MapContainer>
    </section>
  );
}
