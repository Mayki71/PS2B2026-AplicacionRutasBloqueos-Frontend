import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.MAPBOX_TOKEN;

interface MapViewProps {
  onMapLoad?: (map: mapboxgl.Map) => void;
  mapStyle?: 'standard' | 'satellite';
}

const STYLES = {
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  standard:  'mapbox://styles/mapbox/streets-v12',
};

const MapView = ({ onMapLoad, mapStyle = 'satellite' }: MapViewProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: STYLES[mapStyle],
      center: [-68.1193, -16.5],
      zoom: 13,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map.addControl(geolocate, 'bottom-right');

    // Marcador manual al cargar
    let manualMarker: mapboxgl.Marker | null = null;

    map.on('load', () => {
      if (onMapLoad) onMapLoad(map);

      // Mostrar punto azul propio al cargar
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            map.flyTo({ center: [longitude, latitude], zoom: 16, speed: 1.4 });

            const el = document.createElement('div');
            el.style.cssText = `
              width: 16px; height: 16px; border-radius: 50%;
              background: #4a90e2; border: 3px solid #fff;
              box-shadow: 0 0 0 4px rgba(74,144,226,0.35);
            `;
            manualMarker = new mapboxgl.Marker({ element: el })
              .setLngLat([longitude, latitude])
              .addTo(map);
          },
          () => {},
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }

      // Cuando el GeolocateControl activa su propio punto, eliminamos el manual
      geolocate.on('geolocate', () => {
        if (manualMarker) {
          manualMarker.remove();
          manualMarker = null;
        }
      });
    });

    // Evento de centrado desde context menu
    const handleFlyTo = (e: Event) => {
      const coords = (e as CustomEvent<[number, number]>).detail;
      map.flyTo({ center: coords, zoom: 17, speed: 1.2 });
    };
    window.addEventListener('map:flyto', handleFlyTo);

    mapRef.current = map;

    return () => {
      window.removeEventListener('map:flyto', handleFlyTo);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapView;