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
  // Marcadores de previsualización (se muestran al seleccionar, antes de buscar ruta)
  const previewOriginMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const previewDestMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  // Cambia la vista del mapa entre "standard" y "satellite"
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('standard');
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false, x: 0, y: 0, lngLat: null, placeName: '',
  });

  // Callback para que RoutePanel pueda recibir coords de click derecho
  const onSetOriginRef = useRef<((name: string, coords: [number, number]) => void) | null>(null);
  const onSetDestRef = useRef<((name: string, coords: [number, number]) => void) | null>(null);

  /** Crea el elemento HTML de un marcador con etiqueta A o B */
  const createLabelMarkerEl = (label: 'A' | 'B', color: string) => {
    const el = document.createElement('div');
    el.style.cssText = `
      width: 36px; height: 36px; border-radius: 50%;
      background: ${color}; border: 3px solid #fff;
      box-shadow: 0 3px 12px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 900; color: #fff;
      font-family: 'Inter', sans-serif;
      cursor: default;
    `;
    el.textContent = label;
    return el;
  };

  /** Coloca marcador azul "A" en el origen inmediatamente al seleccionarlo */
  const showOriginPreview = useCallback((coords: [number, number]) => {
    const map = mapRef.current;
    if (!map) return;
    previewOriginMarkerRef.current?.remove();
    previewOriginMarkerRef.current = new mapboxgl.Marker({ element: createLabelMarkerEl('A', '#4a90e2') })
      .setLngLat(coords)
      .addTo(map);
  }, []);

  /** Coloca marcador rojo "B" en el destino inmediatamente al seleccionarlo */
  const showDestPreview = useCallback((coords: [number, number]) => {
    const map = mapRef.current;
    if (!map) return;
    previewDestMarkerRef.current?.remove();
    previewDestMarkerRef.current = new mapboxgl.Marker({ element: createLabelMarkerEl('B', '#e74c3c') })
      .setLngLat(coords)
      .addTo(map);
  }, []);

  const clearRouteMarkers = useCallback(() => {
    routeMarkersRef.current.forEach(m => m.remove());
    routeMarkersRef.current = [];
    previewOriginMarkerRef.current?.remove();
    previewOriginMarkerRef.current = null;
    previewDestMarkerRef.current?.remove();
    previewDestMarkerRef.current = null;
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
        () => { },
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
      } catch { }

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
    originCoords?: [number, number], destCoords?: [number, number],
    blockages?: Array<{ ubicaciones: { latitud: number; longitud: number; latitud_fin?: number | null; longitud_fin?: number | null }; id_estado?: number }>
  ) => {
    const map = mapRef.current;
    if (!map) return;

    // Limpiar ruta anterior
    ['route', 'route-alt'].forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });
    routeMarkersRef.current.forEach(m => m.remove());
    routeMarkersRef.current = [];
    setRouteInfo(null);

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

      // ── Detección de bloqueos ACTIVOS ──────────────────────────────────────
      // id_estado puede estar en la raíz o en estados_reporte según el endpoint usado
      const activeBlockages = (blockages ?? []).filter(b => {
        const estado = b.id_estado ?? (b as any).estados_reporte?.id_estado;
        return estado !== 2; // 2 = resuelto
      });

      console.log(`🗺️ Bloqueos activos: ${activeBlockages.length} de ${(blockages ?? []).length}`);

      const DEG_TO_M = 111320;

      function distMetersToSegment(
        pLng: number, pLat: number,
        aLng: number, aLat: number,
        bLng: number, bLat: number
      ): number {
        const cosLat = Math.cos((pLat * Math.PI) / 180);
        const px = (pLng - aLng) * DEG_TO_M * cosLat;
        const py = (pLat - aLat) * DEG_TO_M;
        const dx = (bLng - aLng) * DEG_TO_M * cosLat;
        const dy = (bLat - aLat) * DEG_TO_M;
        const lenSq = dx * dx + dy * dy;

        if (lenSq === 0) {
          return Math.hypot(px, py); // A y B son el mismo punto
        }

        let t = (px * dx + py * dy) / lenSq;
        t = Math.max(0, Math.min(1, t)); // Limitar al segmento entre 0 y 1
        return Math.hypot(px - t * dx, py - t * dy);
      }

      // 1. Pedir rutas a Mapbox SIN waypoints forzados (pidiendo alternativas)
      // Mapbox nos dará hasta 3 rutas posibles (principal y alternativas lógicas)
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${oLng},${oLat};${dLng},${dLat}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}&language=es&alternatives=true&overview=full`;

      console.log('🛣️ Solicitando rutas a Mapbox...');
      const dirRes = await fetch(directionsUrl);
      const dirData = await dirRes.json();

      if (!dirData.routes || dirData.routes.length === 0) {
        console.error('No se encontraron rutas', dirData);
        return;
      }

      // 2. Evaluar las líneas de ruta reales contra los bloqueos
      const BLOCKAGE_RADIUS_M = 30; // 30m es el umbral para detectar si el auto "pisa" el bloqueo

      let bestRoute: any = null;
      let altRoute: any = null;
      let hasBlockageOnBestRoute = false;
      let blockingIncident: any = null; // Guardamos el bloqueo que causó el problema

      for (const r of dirData.routes) {
        const coords = r.geometry.coordinates as [number, number][];
        let hit = null;

        for (const b of activeBlockages) {
          const bLng = b.ubicaciones.longitud;
          const bLat = b.ubicaciones.latitud;
          const bLngFin = b.ubicaciones.longitud_fin ?? bLng;
          const bLatFin = b.ubicaciones.latitud_fin ?? bLat;

          // Verificar si algún punto de la ruta pasa a menos de 30m del bloqueo (punto o línea)
          for (const c of coords) {
            const dist = distMetersToSegment(c[0], c[1], bLng, bLat, bLngFin, bLatFin);
            if (dist < BLOCKAGE_RADIUS_M) {
              hit = b;
              break;
            }
          }
          if (hit) break;
        }

        if (!hit) {
          if (!bestRoute) bestRoute = r; // Primera ruta limpia
          else if (!altRoute) altRoute = r; // Alternativa limpia
        } else if (!blockingIncident) {
          blockingIncident = hit; // Guardar referencia al bloqueo para usarlo en el plan B
        }
      }

      // 3. PLAN B: Búsqueda Radial Exhaustiva
      // Si Mapbox no nos dio alternativas libres de bloqueos (suele pasar si están en la misma avenida)
      // generamos waypoints en círculo alrededor del bloqueo (a 200m, 400m, 600m) hasta encontrar una salida.
      if (!bestRoute && blockingIncident) {
        console.warn('⚠️ Rutas normales bloqueadas. Iniciando búsqueda radial de desvío 360°...');

        const bLng = blockingIncident.ubicaciones.longitud;
        const bLat = blockingIncident.ubicaciones.latitud;
        const cosLat = Math.cos((bLat * Math.PI) / 180);

        // Círculos de búsqueda y ángulos ampliados para bloqueos masivos
        const searchRadii = [200, 400, 800, 1500];
        const angles = [0, 45, 90, 135, 180, 225, 270, 315].map(deg => deg * Math.PI / 180);

        for (const radiusM of searchRadii) {
          console.log(`🔍 Evaluando 8 posibles desvíos a ${radiusM} metros...`);

          let safeRoutesAtThisRadius: any[] = [];

          // Intentar 8 direcciones alrededor del bloqueo
          const detourPromises = angles.map(async (angle) => {
            const wLng = bLng + (Math.cos(angle) * radiusM) / (DEG_TO_M * cosLat);
            const wLat = bLat + (Math.sin(angle) * radiusM) / DEG_TO_M;

            const detourUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${oLng},${oLat};${wLng},${wLat};${dLng},${dLat}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}&overview=full`;

            try {
              const res = await fetch(detourUrl);
              const data = await res.json();

              if (data.routes && data.routes.length > 0) {
                const r = data.routes[0];
                const coords = r.geometry.coordinates as [number, number][];

                let rHits = false;
                for (const b of activeBlockages) {
                  const bLngIter = b.ubicaciones.longitud;
                  const bLatIter = b.ubicaciones.latitud;
                  const bLngFinIter = b.ubicaciones.longitud_fin ?? bLngIter;
                  const bLatFinIter = b.ubicaciones.latitud_fin ?? bLatIter;

                  for (const c of coords) {
                    const dist = distMetersToSegment(c[0], c[1], bLngIter, bLatIter, bLngFinIter, bLatFinIter);
                    if (dist < BLOCKAGE_RADIUS_M) {
                      rHits = true; break;
                    }
                  }
                  if (rHits) break;
                }

                if (!rHits) {
                  safeRoutesAtThisRadius.push(r);
                }
              }
            } catch (e) {
              console.error('Error probando desvío:', e);
            }
          });

          // Esperar a que las 8 peticiones de Mapbox terminen para este radio
          await Promise.all(detourPromises);

          if (safeRoutesAtThisRadius.length > 0) {
            // Encontramos rutas seguras. Ordenarlas por distancia para elegir LA MÁS CORTA.
            safeRoutesAtThisRadius.sort((a, b) => a.distance - b.distance);
            bestRoute = safeRoutesAtThisRadius[0];

            console.log(`✅ ¡Desvío ÓPTIMO encontrado! (Radio: ${radiusM}m, Opciones seguras: ${safeRoutesAtThisRadius.length}, Distancia total: ${(bestRoute.distance / 1000).toFixed(2)} km)`);
            break; // Romper loop de radios, ya tenemos la mejor ruta
          }
        }

        // Si después de probar todo no encontró salida
        if (!bestRoute) {
          console.warn('❌ Misión Imposible: El bloqueo no se puede evadir (quizás es un puente o calle única).');
          bestRoute = dirData.routes[0];
          hasBlockageOnBestRoute = true;
        }
      } else if (!bestRoute) {
        // Fallback genérico por si falla todo
        bestRoute = dirData.routes[0];
        hasBlockageOnBestRoute = true;
      } else {
        console.log('✅ Ruta segura encontrada en las opciones por defecto.');
      }

      // Dibujar ruta alternativa (gris tenue) si existe y es segura
      if (altRoute) {
        map.addSource('route-alt', {
          type: 'geojson',
          data: { type: 'Feature', geometry: altRoute.geometry, properties: {} },
        });
        map.addLayer({
          id: 'route-alt',
          type: 'line',
          source: 'route-alt',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#94a3b8', 'line-width': 3, 'line-opacity': 0.4 },
        });
      }

      // Dibujar ruta principal
      map.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', geometry: bestRoute.geometry, properties: {} },
      });
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': hasBlockageOnBestRoute ? '#ef4444' : '#16a34a', // Rojo si pasa por bloqueo inevitable, verde si evita bloqueos
          'line-width': 5,
          'line-opacity': 0.9,
        },
      });

      // Marcadores A y B definitivos
      previewOriginMarkerRef.current?.remove();
      previewOriginMarkerRef.current = null;
      previewDestMarkerRef.current?.remove();
      previewDestMarkerRef.current = null;

      const mOrigin = new mapboxgl.Marker({ element: createLabelMarkerEl('A', '#4a90e2') }).setLngLat([oLng, oLat]).addTo(map);
      const mDest = new mapboxgl.Marker({ element: createLabelMarkerEl('B', '#e74c3c') }).setLngLat([dLng, dLat]).addTo(map);
      routeMarkersRef.current = [mOrigin, mDest];

      const bounds = new mapboxgl.LngLatBounds();
      (bestRoute.geometry.coordinates as [number, number][]).forEach(c => bounds.extend(c));
      map.fitBounds(bounds, { padding: 80 });

      setRouteInfo({
        duration: bestRoute.duration,
        distance: bestRoute.distance,
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
    showOriginPreview, showDestPreview,
  };
};