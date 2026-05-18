import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.MAPBOX_TOKEN;

/** Obtiene ruta por calles reales entre dos puntos (Mapbox Directions) */
async function fetchRoadRoute(
  lng1: number, lat1: number,
  lng2: number, lat2: number
): Promise<GeoJSON.Geometry | null> {
  try {
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${lng1},${lat1};${lng2},${lat2}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
    );
    const data = await res.json();
    if (data.routes?.[0]) return data.routes[0].geometry;
  } catch { /* ok */ }
  return null;
}

interface MapViewProps {
  onMapLoad?: (map: mapboxgl.Map) => void;
  /** Devuelve la instancia del mapa una vez que está completamente cargado */
  onMapReady?: (map: mapboxgl.Map) => void;
  mapStyle?: 'standard' | 'satellite';
  /** Activa el modo de marcación para crear un reporte (2 clicks = tramo del bloqueo) */
  reportMode?: boolean;
  /** Callback con los dos puntos del bloqueo: [lng, lat] | null */
  onMarkPoints?: (a: [number, number] | null, b: [number, number] | null) => void;
}

const STYLES = {
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  standard:  'mapbox://styles/mapbox/streets-v12',
};

/** Crea un elemento DOM para los marcadores A/B del modo reporte */
function createReportMarkerEl(label: 'A' | 'B', color: string) {
  const el = document.createElement('div');
  el.style.cssText = `
    width: 34px; height: 34px; border-radius: 50%;
    background: ${color}; border: 3px solid #fff;
    box-shadow: 0 2px 12px rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; color: #fff;
    font-family: 'Nunito', sans-serif;
    cursor: pointer;
  `;
  el.textContent = label;
  return el;
}

const MapView = ({ onMapLoad, onMapReady, mapStyle = 'satellite', reportMode, onMarkPoints }: MapViewProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<mapboxgl.Map | null>(null);

  // Refs para el estado del modo reporte (no causan re-renders)
  const markerA      = useRef<mapboxgl.Marker | null>(null);
  const markerB      = useRef<mapboxgl.Marker | null>(null);
  const clickCount   = useRef(0);
  const onMarkRef    = useRef(onMarkPoints);
  useEffect(() => { onMarkRef.current = onMarkPoints; }, [onMarkPoints]);

  // ── Inicialización del mapa (solo una vez) ──────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    // Deshabilitar telemetría de Mapbox (evita ERR_BLOCKED_BY_CLIENT en la consola)
    (mapboxgl as any).config = { ...(mapboxgl as any).config, EVENTS_URL: '' };

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

    let manualMarker: mapboxgl.Marker | null = null;

    map.on('load', () => {
      if (onMapLoad) onMapLoad(map);
      if (onMapReady) onMapReady(map);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            // Guardia: el mapa puede haberse destruido antes de que llegue el callback
            if (!mapRef.current || (mapRef.current as any)._removed) return;
            const { latitude, longitude } = pos.coords;
            map.flyTo({ center: [longitude, latitude], zoom: 16, speed: 1.4 });
            const el = document.createElement('div');
            el.style.cssText = `
              width: 16px; height: 16px; border-radius: 50%;
              background: #4a90e2; border: 3px solid #fff;
              box-shadow: 0 0 0 4px rgba(74,144,226,0.35);
            `;
            try {
              manualMarker = new mapboxgl.Marker({ element: el })
                .setLngLat([longitude, latitude])
                .addTo(map);
            } catch { /* mapa destruido */ }
          },
          () => {},
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }

      geolocate.on('geolocate', () => {
        if (manualMarker) { manualMarker.remove(); manualMarker = null; }
      });
    });

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
  }, []); // eslint-disable-line

  // ── Modo reporte: captura 2 clicks en el mapa ───────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const cleanupReportMode = () => {
      markerA.current?.remove(); markerA.current = null;
      markerB.current?.remove(); markerB.current = null;
      clickCount.current = 0;
      try {
        if (map.getLayer('report-line-layer')) map.removeLayer('report-line-layer');
        if (map.getSource('report-line')) map.removeSource('report-line');
      } catch { /* mapa ya desmontado */ }
    };

    if (!reportMode) {
      cleanupReportMode();
      return;
    }

    // Cambiar cursor en modo reporte
    map.getCanvas().style.cursor = 'crosshair';

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      const { lngLat } = e;
      const coords: [number, number] = [lngLat.lng, lngLat.lat];

      if (clickCount.current === 0) {
        // ── Primer click: Punto A (naranja) ──────────────────────
        markerA.current?.remove();
        markerA.current = new mapboxgl.Marker({ element: createReportMarkerEl('A', '#FCA311') })
          .setLngLat(coords).addTo(map);
        clickCount.current = 1;
        onMarkRef.current?.(coords, null);

      } else if (clickCount.current === 1) {
        // ── Segundo click: Punto B (rojo) + ruta por calles ──────────
        markerB.current?.remove();
        markerB.current = new mapboxgl.Marker({ element: createReportMarkerEl('B', '#e74c3c') })
          .setLngLat(coords).addTo(map);

        const aLngLat = markerA.current!.getLngLat();
        const coordsA: [number, number] = [aLngLat.lng, aLngLat.lat];

        // Source vacío primero para mostrar inmediatamente los marcadores
        const emptyLine: GeoJSON.Feature<GeoJSON.LineString> = {
          type: 'Feature', properties: {},
          geometry: { type: 'LineString', coordinates: [] },
        };

        if (map.getSource('report-line')) {
          (map.getSource('report-line') as mapboxgl.GeoJSONSource).setData(emptyLine);
        } else {
          map.addSource('report-line', { type: 'geojson', data: emptyLine });
          map.addLayer({
            id: 'report-line-layer', type: 'line', source: 'report-line',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#FCA311',
              'line-width': 5,
              'line-opacity': 0.85,
            },
          });
        }

        // Fetch ruta real por calles
        fetchRoadRoute(coordsA[0], coordsA[1], coords[0], coords[1]).then(geometry => {
          if (!geometry || !map.getSource('report-line')) return;
          (map.getSource('report-line') as mapboxgl.GeoJSONSource).setData({
            type: 'Feature', properties: {}, geometry,
          });
        });

        clickCount.current = 2;
        onMarkRef.current?.(coordsA, coords);

      } else {
        // ── Tercer click: reinicia la marcación ───────────────────
        markerA.current?.remove(); markerA.current = null;
        markerB.current?.remove(); markerB.current = null;
        try {
          if (map.getLayer('report-line-layer')) map.removeLayer('report-line-layer');
          if (map.getSource('report-line')) map.removeSource('report-line');
        } catch { /* ok */ }
        clickCount.current = 0;
        onMarkRef.current?.(null, null);
      }
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
      map.getCanvas().style.cursor = '';
      cleanupReportMode();
    };
  }, [reportMode]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapView;