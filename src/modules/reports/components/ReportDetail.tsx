import { useState } from 'react';
import { useReporteDetalle, useVotar, useComentarios } from '../hooks/useReports';
import { buildTituloReporte, tiempoRelativo } from '../reports.types';

interface Props {
  id_reporte: number;
  onBack: () => void;
}

export default function ReportDetail({ id_reporte, onBack }: Props) {
  const { reporte, refetch, loading, error } = useReporteDetalle(id_reporte);
  const { votar, loadingVoto } = useVotar(reporte, refetch);
  const { comentarios, loading: loadingCom, enviando, enviarComentario } = useComentarios(id_reporte);
  const [nuevoComentario, setNuevoComentario] = useState('');

  const handleEnviar = async () => {
    if (!nuevoComentario.trim()) return;
    await enviarComentario(nuevoComentario);
    setNuevoComentario('');
  };

  if (loading) return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}>
          <ArrowLeft />
        </button>
        <span style={S.headerTitle}>Detalle Reporte</span>
      </div>
      <div style={S.centered}><p style={{ color: '#fff' }}>Cargando...</p></div>
    </div>
  );

  if (error || !reporte) return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}><ArrowLeft /></button>
        <span style={S.headerTitle}>Detalle Reporte</span>
      </div>
      <div style={S.centered}>
        <p style={{ color: '#fff' }}>{error ?? 'Reporte no encontrado'}</p>
        <button onClick={onBack} style={S.backLink}>← Volver</button>
      </div>
    </div>
  );

  const titulo = buildTituloReporte(reporte);
  const hace   = tiempoRelativo(reporte.fecha_creacion);

  return (
    <div style={S.page}>

      {/* ── Header ── */}
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}><ArrowLeft /></button>
        <span style={S.headerTitle}>Detalle Reporte</span>
      </div>

      {/* ── Mapa placeholder ── */}
      {/* TODO: Mayki integrará su MapView aquí con lat/lng */}
      <div style={S.mapPlaceholder}>
        <span style={S.mapText}>
          {reporte.ubicaciones.direccion ?? `${reporte.ubicaciones.latitud.toFixed(4)}, ${reporte.ubicaciones.longitud.toFixed(4)}`}
        </span>
      </div>

      {/* ── Cuerpo ── */}
      <div style={S.body}>

        {/* Título + meta */}
        <h1 style={S.title}>{titulo}</h1>
        <p style={S.meta}>{hace} · {reporte.votos.total} votos</p>
        <p style={S.desc}>{reporte.descripcion}</p>

        {/* Votación */}
        <p style={S.voteLabel}>El bloqueo sigue activo?</p>
        <div style={S.voteRow}>
          <button
            style={S.btnActivo}
            onClick={() => votar(1)}
            disabled={loadingVoto}
          >
            Activo ({reporte.votos.activo})
          </button>
          <button
            style={S.btnInactivo}
            onClick={() => votar(2)}
            disabled={loadingVoto}
          >
            Inactivo ({reporte.votos.inactivo})
          </button>
        </div>

        {/* Comentarios */}
        <p style={S.commentsTitle}>Comentarios</p>

        {loadingCom ? (
          <p style={S.emptyMsg}>Cargando comentarios...</p>
        ) : comentarios.length === 0 ? (
          <p style={S.emptyMsg}>Sé el primero en comentar</p>
        ) : (
          comentarios.map((c) => {
            const usuario = c.usuarios
              ? `${c.usuarios.nombre}_${c.usuarios.apellido_paterno}`
              : `usuario_${c.id_comentario}`;
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

        {/* Espacio para que el input fijo no tape el último comentario */}
        <div style={{ height: '80px' }} />
      </div>

      {/* ── Input comentario fijo al fondo ── */}
      <div style={S.inputBar}>
        <input
          style={S.commentInput}
          placeholder="Agregar Comentario..."
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleEnviar()}
          disabled={enviando}
        />
        <button style={S.sendBtn} onClick={handleEnviar} disabled={enviando}>
          <SendIcon />
        </button>
      </div>

    </div>
  );
}

// ─── Estilos ────────────────────────────────────────────────────
const S = {
  page: {
    background: '#F5A623',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    maxWidth: '100%',
    
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    background: '#F5A623',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#fff',
  },
  mapPlaceholder: {
    width: '100%',
    height: '190px',
    background: 'rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
  },
  body: {
    padding: '18px 16px 0',
    flex: 1,
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1A1B3A',
    margin: '0 0 4px',
    lineHeight: 1.2,
  },
  meta: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.85)',
    margin: '0 0 12px',
  },
  desc: {
    fontSize: '14px',
    color: '#fff',
    lineHeight: 1.6,
    margin: '0 0 20px',
  },
  voteLabel: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 10px',
  },
  voteRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '24px',
  },
  btnActivo: {
    flex: 1,
    padding: '13px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    background: '#1A1B3A',   // navy — opción "positiva"
    color: '#fff',
    transition: 'opacity .15s',
  },
  btnInactivo: {
    flex: 1,
    padding: '13px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    background: '#fff',      // blanco — opción "negativa"
    color: '#1A1B3A',
    transition: 'opacity .15s',
  },
  commentsTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#fff',
    textAlign: 'center' as const,
    margin: '0 0 12px',
  },
  emptyMsg: {
    textAlign: 'center' as const,
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    padding: '12px 0',
  },
  commentCard: {
    background: '#fff',
    borderRadius: '10px',
    padding: '10px 14px',
    marginBottom: '8px',
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px',
  },
  commentUser: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1a1a1a',
  },
  commentTime: {
    fontSize: '11px',
    color: '#aaa',
  },
  commentText: {
    fontSize: '13px',
    color: '#555',
    lineHeight: 1.4,
    margin: 0,
  },
  inputBar: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    width: '100%',
    maxWidth: '100%',
    background: '#fff',
    padding: '10px 14px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    borderTop: '0.5px solid #eee',
    boxSizing: 'border-box' as const,
  },
  commentInput: {
    flex: 1,
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    outline: 'none',
    color: '#333',
    background: '#fafafa',
  },
  sendBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#F5A623',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  centered: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

// ─── Iconos SVG inline ──────────────────────────────────────────
function ArrowLeft() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}