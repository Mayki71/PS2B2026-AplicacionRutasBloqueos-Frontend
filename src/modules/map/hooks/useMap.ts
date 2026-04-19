import { useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

const MAPBOX_TOKEN = import.meta.env.MAPBOX_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN;

export const useMap = () => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const handleMapLoad = useCallback((map: mapboxgl.Map) => {
    mapRef.current = map;
    setIsMapLoaded(true);
  }, []);

  const searchRoute = useCallback(async (origin: string, destination: string) => {
    if (!mapRef.current) return;

    try {
      // Geocode origin
      const originRes = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(origin)}.json?access_token=${MAPBOX_TOKEN}&country=BO`
      );
      const originData = await originRes.json();
      const [originLng, originLat] = originData.features[0].center;

      // Geocode destination
      const destRes = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${MAPBOX_TOKEN}&country=BO`
      );
      const destData = await destRes.json();
      const [destLng, destLat] = destData.features[0].center;

      // Get directions
      const dirRes = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${originLng},${originLat};${destLng},${destLat}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );
      const dirData = await dirRes.json();
      const route = dirData.routes[0].geometry;

      const map = mapRef.current;

      // Remove existing layers/sources
      if (map.getLayer('route')) map.removeLayer('route');
      if (map.getSource('route')) map.removeSource('route');

      map.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: route, properties: {} } });
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#4a90e2', 'line-width': 5, 'line-opacity': 0.85 },
      });

      // Fit bounds
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([originLng, originLat]);
      bounds.extend([destLng, destLat]);
      map.fitBounds(bounds, { padding: 80 });

      // Markers
      new mapboxgl.Marker({ color: '#4a90e2' }).setLngLat([originLng, originLat]).addTo(map);
      new mapboxgl.Marker({ color: '#e74c3c' }).setLngLat([destLng, destLat]).addTo(map);
    } catch (err) {
      console.error('Error al buscar ruta:', err);
    }
  }, []);

  return { handleMapLoad, isMapLoaded, searchRoute };
};