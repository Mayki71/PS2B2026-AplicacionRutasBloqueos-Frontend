import { useReporteDetalle, useVotar, useComentarios } from '../hooks/useReports';
import { buildTituloReporte, tiempoRelativo } from '../reports.types';
import { useState } from 'react';

interface Props {
  id_reporte: number;
  onBack: () => void;
}

const S = {
  page: {
    background: '#F5A623',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px 12px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
  },
  headerTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#fff',
  },
  mapPlaceholder: {
    width: '100%',
    height: '200px',
    background: '#d4975c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '13px',
    // TODO: Mayki integrará el mapa aquí pasando lat/lng como props
  },
  body: {
    padding: '20px 20px 100px',
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '6px',
    gap: '12px',
  },
  reportTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#fff',
  },
  meta: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: '12px',
  },
  desc: {
    fontSize: '14px',
    color: '#fff',
    lineHeight: 1.6,
    marginBottom: '20px',
  },
  votingLabel: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '10px',
  },
  votingRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '24px',
  },
  btnActivo: (active: boolean) => ({
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    background: active ? '#1A1B3A' : '#fff',
    color: active ? '#fff' : '#1A1B3A',
    transition: 'all .15s',
  }),
  commentsTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#fff',
    textAlign: 'center' as const,
    marginBottom: '14px',
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
    marginBottom: '4px',
  },
  commentUser: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#333',
  },
  commentTime: {
    fontSize: '11px',
    color: '#aaa',
  },
  commentText: {
    fontSize: '13px',
    color: '#555',
    lineHeight: 1.4,
  },
  inputBar: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    background: '#fff',
    padding: '10px 16px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    borderTop: '0.5px solid #eee',
  },
  commentInput: {
    flex: 1,
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    outline: 'none',
    color: '#333',
  },
  sendBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#F5A623',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
  },
};

export default function ReportDetail({ id_reporte, onBack }: Props) {
  const { reporte, refetch, loading, error } = useReporteDetalle(id_reporte);
  const { votar, loadingVoto } = useVotar(reporte, refetch);
  const { comentarios, loading: loadingCom, enviando, enviarComentario } = useComentarios(id_reporte);
  const [nuevoComentario, setNuevoComentario] = useState('');

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim()) return;
    await enviarComentario(nuevoComentario);
    setNuevoComentario('');
  };

  if (loading) return (
    <div style={{ ...S.page, justifyContent: 'center', alignItems: 'center' }}>
      <p style={{ color: '#fff' }}>Cargando...</p>
    </div>
  );

  if (error || !reporte) return (
    <div style={{ ...S.page, justifyContent: 'center', alignItems: 'center' }}>
      <p style={{ color: '#fff' }}>{error ?? 'Reporte no encontrado'}</p>
      <button onClick={onBack} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', marginTop: 12 }}>
        ← Volver
      </button>
    </div>
  );

  const titulo = buildTituloReporte(reporte);
  const hace   = tiempoRelativo(reporte.fecha_creacion);

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <span style={S.headerTitle}>Detalle Reporte</span>
      </div>

      {/* Mini mapa placeholder */}
      {/* TODO: Mayki integrará su componente de mapa aquí con lat/lng */}
      <div style={S.mapPlaceholder}>
        Mapa · {reporte.ubicaciones.latitud.toFixed(4)}, {reporte.ubicaciones.longitud.toFixed(4)}
      </div>

      <div style={S.body}>
        {/* Título y meta */}
        <div style={S.titleRow}>
          <span style={S.reportTitle}>{titulo}</span>
        </div>
        <p style={S.meta}>
          {hace} · {reporte.votos.total} votos
        </p>
        <p style={S.desc}>{reporte.descripcion}</p>

        {/* Votación */}
        <p style={S.votingLabel}>El bloqueo sigue activo?</p>
        <div style={S.votingRow}>
          <button
            style={S.btnActivo(false)}
            onClick={() => votar(1)}
            disabled={loadingVoto}
          >
            Activo ({reporte.votos.activo})
          </button>
          <button
            style={S.btnActivo(false)}
            onClick={() => votar(2)}
            disabled={loadingVoto}
          >
            Inactivo ({reporte.votos.inactivo})
          </button>
        </div>

        {/* Comentarios */}
        <p style={S.commentsTitle}>Comentarios</p>

        {loadingCom ? (
          <p style={{ color: '#fff', textAlign: 'center', fontSize: 13 }}>Cargando comentarios...</p>
        ) : comentarios.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontSize: 13 }}>
            Sé el primero en comentar
          </p>
        ) : (
          comentarios.map((c) => {
            const nombreUsuario = c.usuarios
              ? `${c.usuarios.nombre}_${c.usuarios.apellido_paterno}`
              : `usuario_${c.id_comentario}`;
            return (
              <div key={c.id_comentario} style={S.commentCard}>
                <div style={S.commentHeader}>
                  <span style={S.commentUser}>{nombreUsuario}</span>
                  <span style={S.commentTime}>{tiempoRelativo(c.fecha_comentario)}</span>
                </div>
                <p style={S.commentText}>{c.comentario}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Input de comentario fijo al fondo */}
      <div style={S.inputBar}>
        <input
          style={S.commentInput}
          placeholder="Agregar Comentario..."
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleEnviarComentario()}
          disabled={enviando}
        />
        <button style={S.sendBtn} onClick={handleEnviarComentario} disabled={enviando}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}