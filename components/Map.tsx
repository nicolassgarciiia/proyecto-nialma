// components/Map.tsx
'use client'

// ¡NUEVO! Importamos Polyline
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet' 
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Icono Explícito (idéntico)
const customMarkerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Interfaz Place (idéntica)
interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

type RouteGeometry = [number, number][]; // [[lat, lng], [lat, lng], ...]

interface MapProps {
  places: Place[];
  routeGeometry: RouteGeometry | null; // Puede ser la ruta, o null si no hay
}

// Componente de Mapa
export default function Map({ places, routeGeometry }: MapProps) {
  const defaultPosition: [number, number] = [40.416775, -3.703790]

  return (
    <MapContainer
      center={defaultPosition}
      zoom={6}
      style={{ height: '500px', width: '100%' }}
      className="rounded-lg shadow-md"
    >
      {/* Capa de "baldosas" (idéntica) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Marcadores (idéntico) */}
      {places.map((place) => (
        <Marker 
          key={place.id} 
          position={[place.lat, place.lng]}
          icon={customMarkerIcon}
        >
          <Popup>{place.name}</Popup>
        </Marker>
      ))}

      {/* --- ¡NUEVO! DIBUJAR LA RUTA --- */}
      {/* Si existe una geometría de ruta, dibuja una Polyline */}
      {routeGeometry && (
        <Polyline 
          positions={routeGeometry} 
          color="blue" // Color de la línea
          weight={5} // Grosor de la línea
        />
      )}

    </MapContainer>
  )
}