import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useReporteDetalle, useVotar, useComentarios } from '../hooks/useReports';
import { deleteReporte } from '../services/reportsService';
import { buildTituloReporte, tiempoRelativo } from '../reports.types';
import { useUI } from '../../../components/UIProvider';
import { Trash2, MapPin, CheckCircle, XCircle, Lock, MessageSquare, Loader2 } from 'lucide-react';

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

interface Props {
  id_reporte: number;
  onBack: () => void;
  onDeleted?: () => void;
}

export default function ReportDetail({ id_reporte, onBack, onDeleted }: Props) {
  const { reporte, setReporte, refetch, loading, error, wasDeleted } = useReporteDetalle(id_reporte);
  const { votar, loadingVoto } = useVotar(reporte, refetch, setReporte);
  const { comentarios, loading: loadingCom, enviando, enviarComentario } = useComentarios(id_reporte);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const { showToast, showConfirm } = useUI();
  const [deleting, setDeleting] = useState(false);
  const [countdown, setCountdown] = useState(4);

  // Mapa de detalle
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Usuario logueado
  const usuarioStr = localStorage.getItem('usuario');
  const usuarioActual = usuarioStr ? JSON.parse(usuarioStr) : null;
  const esDueño = reporte && usuarioActual ? reporte.id_usuario === usuarioActual.id : false;

  // Mapa de detalle — guardamos las coords del bloqueo para comparar
  const blockageCoordsRef = useRef<string>('');

  // Auto-redirect cuando el reporte es eliminado por su dueño
  useEffect(() => {
    if (!wasDeleted) return;
    setCountdown(4);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); onBack(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [wasDeleted, onBack]);

  // Efecto 1: Inicializar mapa UNA SOLA VEZ cuando el reporte carga por primera vez
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !reporte) return;

    const { latitud, longitud, latitud_fin, longitud_fin } = reporte.ubicaciones;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitud, latitud],
      zoom: 14,
      interactive: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    map.on('load', () => {
      // Marcador A (inicio)
      const elA = document.createElement('div');
      elA.style.cssText = `
        width:30px;height:30px;border-radius:50%;background:#FCA311;
        border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);
        display:flex;align-items:center;justify-content:center;
        font-size:11px;font-weight:800;color:#fff;
      `;
      elA.textContent = 'A';
      new mapboxgl.Marker({ element: elA }).setLngLat([longitud, latitud]).addTo(map);

      // Marcador B + ruta real por calles
      if (latitud_fin != null && longitud_fin != null) {
        const elB = document.createElement('div');
        elB.style.cssText = `
          width:30px;height:30px;border-radius:50%;background:#e74c3c;
          border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:800;color:#fff;
        `;
        elB.textContent = 'B';
        new mapboxgl.Marker({ element: elB }).setLngLat([longitud_fin, latitud_fin]).addTo(map);

        // Source vacío → actualizar con ruta real
        map.addSource('detail-line', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
        });
        map.addLayer({
          id: 'detail-line',
          type: 'line',
          source: 'detail-line',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#FCA311', 'line-width': 5, 'line-opacity': 0.85 },
        });

        // Fetch ruta por calles reales
        fetchRoadRoute(longitud, latitud, longitud_fin, latitud_fin).then(geometry => {
          if (!geometry || !map.getSource('detail-line')) return;
          (map.getSource('detail-line') as mapboxgl.GeoJSONSource).setData({
            type: 'Feature', properties: {}, geometry,
          });
        });

        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([longitud, latitud]);
        bounds.extend([longitud_fin, latitud_fin]);
        map.fitBounds(bounds, { padding: 50 });
      }
    });

    // Guardar coords actuales para no reinicializar si solo cambian votos/comentarios
    blockageCoordsRef.current = `${longitud},${latitud},${longitud_fin},${latitud_fin}`;
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; blockageCoordsRef.current = ''; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reporte?.id_reporte]); // Solo cuando cambia el ID del reporte (nueva vista)


  const handleEnviar = async () => {
    if (!nuevoComentario.trim()) return;
    await enviarComentario(nuevoComentario);
    setNuevoComentario('');
  };

  const handleEliminar = () => {
    showConfirm({
      title: 'Eliminar reporte',
      message: '¿Estás seguro que deseas eliminar este reporte? Esta acción no se puede deshacer.',
      confirmLabel: 'Sí, eliminar',
      cancelLabel: 'Cancelar',
      danger: true,
      onConfirm: async () => {
        setDeleting(true);
        try {
          await deleteReporte(id_reporte);
          showToast('Reporte eliminado correctamente', 'success');
          onDeleted?.();
          onBack();
        } catch (e: any) {
          showToast(e?.response?.data?.message ?? 'Error al eliminar el reporte', 'error');
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  if (loading) return (
    <div style={S.page}>
      <TopBar title="Detalle Reporte" onBack={onBack} />
      <div style={S.centered}><p style={{ color: '#fff' }}>Cargando...</p></div>
    </div>
  );

  // Pantalla cuando el reporte fue eliminado (por su dueño o detectado en polling)
  if (wasDeleted) return (
    <div style={{ ...S.page, alignItems: 'center', justifyContent: 'center', gap: 0 }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        background: 'rgba(0,0,0,0.2)', borderRadius: '20px', padding: '40px 32px',
        maxWidth: '360px', textAlign: 'center', margin: '0 16px',
      }}>
        {/* Ícono de papelera animado */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Trash2 size={36} color="#fff" />
        </div>
        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: 0 }}>
          Reporte eliminado
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', lineHeight: 1.5, margin: 0 }}>
          Este reporte ha sido eliminado por su autor y ya no está disponible.
        </p>
        {/* Barra de progreso del countdown */}
        <div style={{ width: '100%', background: 'rgba(255,255,255,0.2)', borderRadius: '100px', height: '6px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '100px', background: '#fff',
            width: `${(countdown / 4) * 100}%`,
            transition: 'width 0.9s linear',
          }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>
          Volviendo al mapa en <strong style={{ color: '#fff' }}>{countdown}</strong> segundo{countdown !== 1 ? 's' : ''}...
        </p>
        <button onClick={onBack} style={{
          background: '#fff', color: '#FCA311', border: 'none',
          borderRadius: '10px', padding: '10px 24px',
          fontSize: '14px', fontWeight: 700, cursor: 'pointer',
        }}>
          Volver ahora
        </button>
      </div>
    </div>
  );

  if (error || !reporte) return (
    <div style={S.page}>
      <TopBar title="Detalle Reporte" onBack={onBack} />
      <div style={S.centered}>
        <p style={{ color: '#fff' }}>{error ?? 'Reporte no encontrado'}</p>
        <button onClick={onBack} style={S.backLink}>← Volver</button>
      </div>
    </div>
  );

  const titulo = buildTituloReporte(reporte);
  const hace = tiempoRelativo(reporte.fecha_creacion);

  return (
    <>
      <style>{`
        .rd-container { display: flex; flex-direction: column; width: 100%; height: 100%; position: absolute; inset: 0; }
        .rd-map { width: 100%; height: 40%; position: relative; background: #1a1a2e; flex: none; }
        .rd-info { width: 100%; height: 60%; position: relative; background: #FCA311; display: flex; flex-direction: column; overflow: hidden; }
        
        @media (min-width: 768px) {
          .rd-container { flex-direction: row; }
          .rd-map { width: 60%; height: 100%; }
          .rd-info { width: 40%; height: 100%; }
        }
      `}</style>
      <div className="rd-container">

        {/* ── MAPA (Izquierda en PC, Arriba en Móvil) ─────── */}
        <div className="rd-map">
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
          <button style={S.backBtnFloat} onClick={onBack} title="Volver al mapa">
            <ArrowLeft size={26} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── FORMULARIO (Derecha en PC, Abajo en Móvil) ─────────────────────── */}
        <div className="rd-info">

          {/* Imagen del bloqueo */}
          {reporte.imagen_principal_url && (
            <div style={S.imageWrapper}>
              <img src={reporte.imagen_principal_url} alt="Imagen del bloqueo" style={S.image} />
            </div>
          )}

          {/* Encabezado del panel */}
          <div style={S.infoHeader}>
            <span style={S.tipoBadge}>
              {reporte.tipos_bloqueo.nombre}
            </span>
            {esDueño && (
              <button style={S.deleteBtn} onClick={handleEliminar} disabled={deleting}>
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Eliminar
              </button>
            )}
          </div>

          <div style={S.scrollable}>
            {/* Título y meta */}
            <h1 style={S.title}>{titulo}</h1>
            <p style={S.meta}>{hace} · {reporte.votos.total} votos</p>
            <p style={S.desc}>{reporte.descripcion}</p>

            {/* Ubicación */}
            {reporte.ubicaciones.direccion && (
              <p style={{ ...S.ubicacion, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} color="#9ca3af" />
                {reporte.ubicaciones.direccion}
              </p>
            )}

            <div style={S.divider} />

            {/* Votación — solo si NO eres el dueño */}
            <p style={S.voteLabel}>¿El bloqueo sigue activo?</p>
            {esDueño ? (
              <div style={S.ownerNote}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                  <Lock size={14} /> Reportado por ti — no puedes votar en tu propio reporte
                </span>
                <div style={S.voteCountsRow}>
                  <span style={{ ...S.voteCount, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} color="#10b981" /> Activo: <strong>{reporte.votos.activo}</strong>
                  </span>
                  <span style={{ ...S.voteCount, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <XCircle size={14} color="#ef4444" /> Inactivo: <strong>{reporte.votos.inactivo}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <div style={S.voteRow}>
                <button style={{ ...S.btnActivo, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={() => votar(1)} disabled={loadingVoto}>
                  <CheckCircle size={16} /> Activo ({reporte.votos.activo})
                </button>
                <button style={{ ...S.btnInactivo, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={() => votar(2)} disabled={loadingVoto}>
                  <XCircle size={16} /> Inactivo ({reporte.votos.inactivo})
                </button>
              </div>
            )}

            <div style={S.divider} />

            {/* Comentarios */}
            <p style={{ ...S.commentsTitle, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={16} /> Comentarios
            </p>

            {loadingCom ? (
              <p style={S.emptyMsg}>Cargando comentarios...</p>
            ) : comentarios.length === 0 ? (
              <p style={S.emptyMsg}>Sé el primero en comentar</p>
            ) : (
              comentarios.map((c) => {
                const usuario = c.usuarios
                  ? `${c.usuarios.nombre} ${c.usuarios.apellido_paterno}`
                  : `Usuario`;
                return (
                  <div key={c.id_comentario} style={S.commentCard}>
                    <div style={S.commentHeader}>
                      <span style={S.commentUser}>{usuario}</span>
                      <span style={S.commentTime}>{tiempoRelativo(c.fecha_comentario)}</span>
                    </div>
                    <p style={S.commentText}>{c.comentario}</p>
                  </div>
                );
              })
            )}

            <div style={{ height: '80px' }} />
          </div>

          {/* Input de comentario fijo al fondo */}
          <div style={S.inputBar}>
            <input
              style={S.commentInput}
              placeholder="Agregar comentario..."
              value={nuevoComentario}
              onChange={e => setNuevoComentario(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEnviar()}
              disabled={enviando}
            />
            <button style={S.sendBtn} onClick={handleEnviar} disabled={enviando}>
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────
function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: '#FCA311' }}>
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }} onClick={onBack}>
        <ArrowLeft />
      </button>
      <span style={{ fontSize: '17px', fontWeight: 700, color: '#fff' }}>{title}</span>
    </div>
  );
}

function ArrowLeft() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="#FCA311" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

// ── Estilos ──────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  splitContainer: {
    display: 'flex', width: '100%', height: '100%',
    position: 'absolute', inset: 0,
  },
  mapSide: {
    flex: '0 0 55%', position: 'relative',
    background: '#1a1a2e',
  },
  infoSide: {
    flex: '0 0 45%', display: 'flex', flexDirection: 'column',
    background: '#FCA311', position: 'relative', overflow: 'hidden',
  },
  backBtnFloat: {
    position: 'absolute', top: '16px', left: '16px', zIndex: 10,
    background: '#FCA311', border: 'none', borderRadius: '50%',
    width: '48px', height: '48px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', backdropFilter: 'blur(6px)',
    boxShadow: '0 4px 12px rgba(249,115,22,0.4)', transition: 'transform 0.15s',
  },
  imageWrapper: {
    width: '100%', maxHeight: '160px', overflow: 'hidden',
    flexShrink: 0, background: 'rgba(0,0,0,0.2)',
  },
  image: {
    width: '100%', maxHeight: '160px',
    objectFit: 'contain', display: 'block',
  },
  infoHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px 0', flexShrink: 0,
  },
  tipoBadge: {
    fontSize: '11px', fontWeight: 800, color: '#fff',
    background: 'rgba(0,0,0,0.2)', borderRadius: '20px',
    padding: '4px 12px', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  deleteBtn: {
    fontSize: '13px', fontWeight: 700, color: '#fff',
    background: 'rgba(231,76,60,0.8)', border: 'none',
    borderRadius: '20px', padding: '5px 12px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '6px',
  },
  scrollable: {
    flex: 1, overflowY: 'auto', padding: '12px 16px 0',
  },
  title: {
    fontSize: '22px', fontWeight: 800, color: '#1A1B3A',
    margin: '8px 0 4px', lineHeight: 1.25,
  },
  meta: {
    fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: '0 0 8px',
  },
  desc: {
    fontSize: '15px', color: '#fff', lineHeight: 1.6, margin: '0 0 8px',
  },
  ubicacion: {
    fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: '0 0 12px',
  },
  divider: {
    height: '1px', background: 'rgba(255,255,255,0.2)', margin: '12px 0',
  },
  voteLabel: {
    fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 8px',
  },
  ownerNote: {
    background: 'rgba(0,0,0,0.15)', borderRadius: '10px', padding: '10px 12px',
    fontSize: '12px', color: 'rgba(255,255,255,0.85)', marginBottom: '8px',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  voteCountsRow: { display: 'flex', gap: '16px' },
  voteCount: { fontSize: '14px', color: '#fff' },
  voteRow: { display: 'flex', gap: '8px', marginBottom: '8px' },
  btnActivo: {
    flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
    background: '#1A1B3A', color: '#fff', transition: 'opacity .15s',
  },
  btnInactivo: {
    flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
    background: '#fff', color: '#1A1B3A', transition: 'opacity .15s',
  },
  commentsTitle: {
    fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 10px',
  },
  emptyMsg: {
    textAlign: 'center', color: 'rgba(255,255,255,0.7)',
    fontSize: '13px', padding: '8px 0',
  },
  commentCard: {
    background: '#fff', borderRadius: '10px', padding: '10px 12px', marginBottom: '8px',
  },
  commentHeader: {
    display: 'flex', justifyContent: 'space-between', marginBottom: '4px',
  },
  commentUser: { fontSize: '14px', fontWeight: 700, color: '#1a1a1a' },
  commentTime: { fontSize: '12px', color: '#aaa' },
  commentText: { fontSize: '14px', color: '#555', lineHeight: 1.4, margin: 0 },
  inputBar: {
    flexShrink: 0,
    background: '#fff', padding: '10px 14px',
    display: 'flex', gap: '8px', alignItems: 'center',
    borderTop: '1px solid rgba(0,0,0,0.1)',
  },
  commentInput: {
    flex: 1, border: '1px solid #e0e0e0', borderRadius: '8px',
    padding: '9px 12px', fontSize: '13px', outline: 'none',
    color: '#333', background: '#fafafa',
  },
  sendBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '6px', display: 'flex', alignItems: 'center', flexShrink: 0,
  },
  centered: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '12px',
  },
  backLink: {
    background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px',
  },
  page: {
    background: '#FCA311', minHeight: '100vh',
    display: 'flex', flexDirection: 'column',
  },
};