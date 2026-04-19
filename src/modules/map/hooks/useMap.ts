import { useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.MAPBOX_TOKEN;

export interface RouteInfo {
  duration: number;
  distance: number;
  originName: string;
  destinationName: string;
  originCoords: [number, number];
  destinationCoords: [number, number];
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  lngLat: [number, number] | null;
  placeName: string;
}

export const useMap = () => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const routeMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('satellite');
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false, x: 0, y: 0, lngLat: null, placeName: '',
  });

  // Callback para que RoutePanel pueda recibir coords de click derecho
  const onSetOriginRef = useRef<((name: string, coords: [number, number]) => void) | null>(null);
  const onSetDestRef = useRef<((name: string, coords: [number, number]) => void) | null>(null);

  const clearRouteMarkers = useCallback(() => {
    routeMarkersRef.current.forEach(m => m.remove());
    routeMarkersRef.current = [];
  }, []);

  const clearRoute = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer('route')) map.removeLayer('route');
    if (map.getSource('route')) map.removeSource('route');
    clearRouteMarkers();
    setRouteInfo(null);
  }, [clearRouteMarkers]);

  const handleMapLoad = useCallback((map: mapboxgl.Map) => {
    mapRef.current = map;
    setIsMapLoaded(true);

    // Solo hacer zoom a la ubicación, sin marcador manual
    // El GeolocateControl ya muestra el punto azul con dirección
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.flyTo({ center: [longitude, latitude], zoom: 16, speed: 1.4 });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    // Click derecho → context menu
    map.on('contextmenu', async (e) => {
      e.preventDefault();
      const { lng, lat } = e.lngLat;
      const point = e.point;

      // Reverse geocode
      let placeName = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es&limit=1`
        );
        const data = await res.json();
        if (data.features?.[0]) placeName = data.features[0].place_name;
      } catch {}

      setContextMenu({ visible: true, x: point.x, y: point.y, lngLat: [lng, lat], placeName });
    });

    // Click normal → cerrar context menu
    map.on('click', () => setContextMenu(prev => ({ ...prev, visible: false })));
  }, []);

  const toggleMapStyle = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const next = mapStyle === 'satellite' ? 'standard' : 'satellite';
    const styleUrl = next === 'satellite'
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
      : 'mapbox://styles/mapbox/streets-v12';
    map.setStyle(styleUrl);
    // Redibujar ruta al cambiar estilo
    map.once('style.load', () => {
      if (routeInfo) {
        // la ruta se pierde al cambiar estilo, se notifica al usuario
      }
    });
    setMapStyle(next);
  }, [mapStyle, routeInfo]);

  const searchRoute = useCallback(async (
    origin: string, destination: string,
    originCoords?: [number, number], destCoords?: [number, number]
  ) => {
    const map = mapRef.current;
    if (!map) return;

    // Limpiar ruta anterior
    clearRoute();

    try {
      let oLng: number, oLat: number, dLng: number, dLat: number;
      let originName = origin, destName = destination;

      if (originCoords) {
        [oLng, oLat] = originCoords;
      } else {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(origin)}.json?access_token=${MAPBOX_TOKEN}&country=BO&language=es&limit=1`
        );
        const data = await res.json();
        [oLng, oLat] = data.features[0].center;
        originName = data.features[0].place_name;
      }

      if (destCoords) {
        [dLng, dLat] = destCoords;
      } else {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${MAPBOX_TOKEN}&country=BO&language=es&limit=1`
        );
        const data = await res.json();
        [dLng, dLat] = data.features[0].center;
        destName = data.features[0].place_name;
      }

      const dirRes = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${oLng},${oLat};${dLng},${dLat}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}&language=es`
      );
      const dirData = await dirRes.json();
      const route = dirData.routes[0];

      // Dibujar ruta
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

      // Marcadores nuevos
      const mOrigin = new mapboxgl.Marker({ color: '#4a90e2' })
        .setLngLat([oLng, oLat])
        .addTo(map);
      const mDest = new mapboxgl.Marker({ color: '#e74c3c' })
        .setLngLat([dLng, dLat])
        .addTo(map);
      routeMarkersRef.current = [mOrigin, mDest];

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([oLng, oLat]);
      bounds.extend([dLng, dLat]);
      map.fitBounds(bounds, { padding: 80 });

      setRouteInfo({
        duration: route.duration,
        distance: route.distance,
        originName,
        destinationName: destName,
        originCoords: [oLng, oLat],
        destinationCoords: [dLng, dLat],
      });
    } catch (err) {
      console.error('Error al buscar ruta:', err);
    }
  }, [clearRoute]);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  return {
    handleMapLoad, isMapLoaded, searchRoute, routeInfo,
    mapStyle, toggleMapStyle, clearRoute,
    contextMenu, closeContextMenu,
    onSetOriginRef, onSetDestRef,
  };
};