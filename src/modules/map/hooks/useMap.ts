import { useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.MAPBOX_TOKEN;

export interface RouteInfo {
  duration: number; // segundos
  distance: number; // metros
  originName: string;
  destinationName: string;
  originCoords: [number, number];
  destinationCoords: [number, number];
}

export const useMap = () => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('satellite');

  const handleMapLoad = useCallback((map: mapboxgl.Map) => {
    mapRef.current = map;
    setIsMapLoaded(true);

    // Zoom a ubicación del usuario al cargar
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.flyTo({ center: [longitude, latitude], zoom: 16, speed: 1.4 });

          if (userMarkerRef.current) userMarkerRef.current.remove();
          const el = document.createElement('div');
          el.style.cssText = `
            width:18px;height:18px;border-radius:50%;
            background:#4a90e2;border:3px solid #fff;
            box-shadow:0 0 0 3px rgba(74,144,226,0.4);
          `;
          userMarkerRef.current = new mapboxgl.Marker({ element: el })
            .setLngLat([longitude, latitude])
            .addTo(map);
        },
        () => {} // sin permisos, no hacer nada
      );
    }
  }, []);

  const toggleMapStyle = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const next = mapStyle === 'satellite' ? 'standard' : 'satellite';
    const styleUrl = next === 'satellite'
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
      : 'mapbox://styles/mapbox/streets-v12';
    map.setStyle(styleUrl);
    setMapStyle(next);
  }, [mapStyle]);

  const searchRoute = useCallback(async (origin: string, destination: string) => {
    const map = mapRef.current;
    if (!map) return;

    try {
      const geocode = async (q: string) => {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${MAPBOX_TOKEN}&country=BO&language=es&limit=1`
        );
        const data = await res.json();
        return data.features[0];
      };

      const [originFeat, destFeat] = await Promise.all([geocode(origin), geocode(destination)]);
      const [oLng, oLat] = originFeat.center;
      const [dLng, dLat] = destFeat.center;

      const dirRes = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${oLng},${oLat};${dLng},${dLat}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}&language=es`
      );
      const dirData = await dirRes.json();
      const route = dirData.routes[0];

      // Dibujar ruta
      if (map.getLayer('route')) map.removeLayer('route');
      if (map.getSource('route')) map.removeSource('route');

      map.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', geometry: route.geometry, properties: {} },
      });
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#4f46e5', 'line-width': 5, 'line-opacity': 0.9 },
      });

      // Marcadores
      document.querySelectorAll('.route-marker').forEach(el => el.remove());

      new mapboxgl.Marker({ color: '#4a90e2' })
        .setLngLat([oLng, oLat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(originFeat.place_name))
        .addTo(map);

      new mapboxgl.Marker({ color: '#e74c3c' })
        .setLngLat([dLng, dLat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(destFeat.place_name))
        .addTo(map);

      // Fit bounds
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([oLng, oLat]);
      bounds.extend([dLng, dLat]);
      map.fitBounds(bounds, { padding: 80 });

      setRouteInfo({
        duration: route.duration,
        distance: route.distance,
        originName: originFeat.place_name,
        destinationName: destFeat.place_name,
        originCoords: [oLng, oLat],
        destinationCoords: [dLng, dLat],
      });
    } catch (err) {
      console.error('Error al buscar ruta:', err);
    }
  }, []);

  return { handleMapLoad, isMapLoaded, searchRoute, routeInfo, mapStyle, toggleMapStyle };
};