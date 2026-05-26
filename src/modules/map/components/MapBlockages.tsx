import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Reporte } from '../../reports/reports.types';
import { tiempoRelativo } from '../../reports/reports.types';
import { getTipoIcono, getTipoColor } from '../../../utils/blockageIcons';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.MAPBOX_TOKEN;

interface MapBlockagesProps {
  map: mapboxgl.Map | null;
  reportes: Reporte[];
  tiposFiltro: number[];
  onSelectReporte: (id: number) => void;
}

function getColor(nombre: string) { return getTipoColor(nombre); }
function getIcono(nombre: string) { return getTipoIcono(nombre); }

function createBlockageMarkerEl(iconoUrl: string) {
  const el = document.createElement('div');
  // El outer div NO debe tener transform — Mapbox lo usa internamente para posicionar
  el.style.cssText = `
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
  `;
  const img = document.createElement('img');
  img.src = iconoUrl;
  // El transform:scale va en el <img> hijo, no en el div raíz
  img.style.cssText = `
    width: 100%; height: 100%; object-fit: contain;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.55));
    transition: transform 0.15s ease, filter 0.15s ease;
    transform-origin: center center;
  `;
  img.alt = '';
  el.appendChild(img);

  el.onmouseenter = () => {
    img.style.transform = 'scale(1.2)';
    img.style.filter = 'drop-shadow(0 4px 14px rgba(0,0,0,0.75)) brightness(1.1)';
  };
  el.onmouseleave = () => {
    img.style.transform = 'scale(1)';
    img.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.55))';
  };
  return el;
}

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

// Datos de ruta guardados para poder re-dibujar tras cambio de estilo
interface RouteData {
  lineId: string;
  color: string;
  geometry: GeoJSON.Geometry;
  id_reporte: number;
}

export default function MapBlockages({ map, reportes, tiposFiltro, onSelectReporte }: MapBlockagesProps) {
  const markersRef   = useRef<mapboxgl.Marker[]>([]);
  const popupsRef    = useRef<mapboxgl.Popup[]>([]);
  const lineIdsRef   = useRef<string[]>([]);
  // Cache de geometrías ya descargadas: id_reporte → GeoJSON.Geometry
  const routeCacheRef = useRef<Map<number, GeoJSON.Geometry>>(new Map());
  // Lista de rutas activas para re-dibujar tras estilo
  const activeRoutesRef = useRef<RouteData[]>([]);

  /** Añade un source+layer de ruta al mapa (idempotente) */
  const addRouteLayer = useCallback((map: mapboxgl.Map, route: RouteData) => {
    try {
      if (!map.getSource(route.lineId)) {
        map.addSource(route.lineId, {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: route.geometry },
        });
        map.addLayer({
          id: route.lineId,
          type: 'line',
          source: route.lineId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': route.color,
            'line-width': 5,
            'line-opacity': 0.85,
          },
        });
        map.on('click', route.lineId, () => onSelectReporte(route.id_reporte));
        map.on('mouseenter', route.lineId, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', route.lineId, () => { map.getCanvas().style.cursor = ''; });
      } else {
        // Ya existe el source, solo actualizar data
        (map.getSource(route.lineId) as mapboxgl.GeoJSONSource).setData({
          type: 'Feature', properties: {}, geometry: route.geometry,
        });
      }
    } catch { /* ok */ }
  }, [onSelectReporte]);

  /** Re-dibuja TODAS las rutas activas (se llama tras style.load) */
  const redrawRoutes = useCallback(() => {
    if (!map) return;
    activeRoutesRef.current.forEach(route => addRouteLayer(map, route));
  }, [map, addRouteLayer]);

  // ── Escuchar style.load para re-dibujar rutas tras cambio de estilo ──
  useEffect(() => {
    if (!map) return;
    map.on('style.load', redrawRoutes);
    return () => {
      map.off('style.load', redrawRoutes);
    };
  }, [map, redrawRoutes]);

  // ── Effect principal: marcadores + rutas ────────────────────────────
  useEffect(() => {
    if (!map) return;

    // Limpiar marcadores y popups anteriores
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    popupsRef.current.forEach(p => p.remove());
    popupsRef.current = [];

    // Limpiar capas anteriores
    lineIdsRef.current.forEach(id => {
      try {
        if (map.getLayer(id)) map.removeLayer(id);
        if (map.getSource(id)) map.removeSource(id);
      } catch { /* ok */ }
    });
    lineIdsRef.current = [];
    activeRoutesRef.current = [];

    const activos = reportes.filter(r => r.id_estado !== 2);
    const filtrados = tiposFiltro.length > 0
      ? activos.filter(r => tiposFiltro.includes(r.tipos_bloqueo.id_tipo_bloqueo))
      : activos;

    filtrados.forEach(reporte => {
      const { ubicaciones, tipos_bloqueo } = reporte;
      const color    = getColor(tipos_bloqueo.nombre);
      const iconoUrl = getIcono(tipos_bloqueo.nombre);
      const lng = ubicaciones.longitud;
      const lat = ubicaciones.latitud;

      // ── Marcador ────────────────────────────────────────────────────
      const el = createBlockageMarkerEl(iconoUrl);
      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lng, lat])
        .addTo(map);

      // ── Popup hover ─────────────────────────────────────────────────
      const popup = new mapboxgl.Popup({
        closeButton: false, closeOnClick: false,
        offset: 28, maxWidth: '220px',
      }).setHTML(`
        <div style="font-family:system-ui,sans-serif;padding:8px 10px;">
          <div style="font-size:13px;font-weight:800;color:#1a1a2e;margin-bottom:3px;display:flex;align-items:center;gap:6px;">
            <img src="${iconoUrl}" style="width:16px;height:16px;object-fit:contain;" alt=""/>
            ${tipos_bloqueo.nombre}
          </div>
          <div style="font-size:11px;color:#555;line-height:1.4;margin-bottom:4px;">
            ${reporte.descripcion.slice(0, 70)}${reporte.descripcion.length > 70 ? '\u2026' : ''}
          </div>
          <div style="font-size:10px;color:#999;font-weight:600;">
            ${tiempoRelativo(reporte.fecha_creacion)} · ${reporte.votos?.total ?? 0} votos
          </div>
        </div>
      `);

      el.addEventListener('mouseenter', () => popup.setLngLat([lng, lat]).addTo(map));
      el.addEventListener('mouseleave', () => popup.remove());
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.remove();
        onSelectReporte(reporte.id_reporte);
        map.flyTo({ center: [lng, lat], zoom: 15, speed: 1.2 });
      });

      markersRef.current.push(marker);
      popupsRef.current.push(popup);

      // ── Ruta por calles (si hay punto B) ────────────────────────────
      if (ubicaciones.latitud_fin != null && ubicaciones.longitud_fin != null) {
        const lineId = `blockage-line-${reporte.id_reporte}`;
        const lngFin = ubicaciones.longitud_fin;
        const latFin = ubicaciones.latitud_fin;
        lineIdsRef.current.push(lineId);

        // ¿Tenemos la geometría en caché?
        const cached = routeCacheRef.current.get(reporte.id_reporte);
        if (cached) {
          const route: RouteData = { lineId, color, geometry: cached, id_reporte: reporte.id_reporte };
          activeRoutesRef.current.push(route);
          addRouteLayer(map, route);
        } else {
          // Source vacío mientras descargamos
          try {
            if (!map.getSource(lineId)) {
              map.addSource(lineId, {
                type: 'geojson',
                data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
              });
              map.addLayer({
                id: lineId, type: 'line', source: lineId,
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': color, 'line-width': 5, 'line-opacity': 0.85 },
              });
              map.on('click', lineId, () => onSelectReporte(reporte.id_reporte));
              map.on('mouseenter', lineId, () => { map.getCanvas().style.cursor = 'pointer'; });
              map.on('mouseleave', lineId, () => { map.getCanvas().style.cursor = ''; });
            }
          } catch { /* ok */ }

          // Descargar y cachear la geometría
          fetchRoadRoute(lng, lat, lngFin, latFin).then(geometry => {
            if (!geometry) return;
            routeCacheRef.current.set(reporte.id_reporte, geometry);
            const route: RouteData = { lineId, color, geometry, id_reporte: reporte.id_reporte };
            // Añadir a la lista de rutas activas para futuros re-dibujos
            activeRoutesRef.current.push(route);
            // Actualizar el source si aún existe
            try {
              if (map.getSource(lineId)) {
                (map.getSource(lineId) as mapboxgl.GeoJSONSource).setData({
                  type: 'Feature', properties: {}, geometry,
                });
              }
            } catch { /* ok */ }
          });
        }
      }
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      popupsRef.current.forEach(p => p.remove());
      lineIdsRef.current.forEach(id => {
        try {
          if (map.getLayer(id)) map.removeLayer(id);
          if (map.getSource(id)) map.removeSource(id);
        } catch { /* ok */ }
      });
    };
  }, [map, reportes, tiposFiltro, onSelectReporte, addRouteLayer]);

  return null;
}
