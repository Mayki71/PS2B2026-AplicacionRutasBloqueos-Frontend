import { useState } from 'react';
import { useReporteDetalle, useVotar, useComentarios } from '../hooks/useReports';
import { buildTituloReporte, tiempoRelativo } from '../reports.types';

interface Props {
  id_reporte: number;
  onBack: () => void;
}

export default function ReportDetail({ id_reporte, onBack }: Props) {
  const { reporte, refetch, loading, error } = useReporteDetalle(id_reporte);
  const { votar, loadingVoto }               = useVotar(reporte, refetch);
  const { comentarios, loading: loadingCom, enviando, enviarComentario } = useComentarios(id_reporte);
  const [nuevoComentario, setNuevoComentario] = useState('');

  const handleEnviar = async () => {
    if (!nuevoComentario.trim()) return;
    await enviarComentario(nuevoComentario);
    setNuevoComentario('');
  };

  const renderContent = () => {
    if (loading) return <div className="rd-center"><p style={{ color: '#fff' }}>Cargando...</p></div>;
    if (error || !reporte) return (
      <div className="rd-center">
        <p style={{ color: '#fff' }}>{error ?? 'Reporte no encontrado'}</p>
        <button className="rd-back-link" onClick={onBack}>← Volver</button>
      </div>
    );

    const titulo = buildTituloReporte(reporte);
    const hace   = tiempoRelativo(reporte.fecha_creacion);

    return (
      <div className="rd-body">
        <h1 className="rd-title">{titulo}</h1>
        <p className="rd-meta">{hace} · {reporte.votos.total} votos</p>
        <p className="rd-desc">{reporte.descripcion}</p>

        <p className="rd-vote-label">El bloqueo sigue activo?</p>
        <div className="rd-vote-row">
          <button className="rd-btn-activo" onClick={() => votar(1)} disabled={loadingVoto}>
            Activo ({reporte.votos.activo})
          </button>
          <button className="rd-btn-inactivo" onClick={() => votar(2)} disabled={loadingVoto}>
            Inactivo ({reporte.votos.inactivo})
          </button>
        </div>

        <p className="rd-comments-title">Comentarios</p>

        {loadingCom ? (
          <p className="rd-empty">Cargando comentarios...</p>
        ) : comentarios.length === 0 ? (
          <p className="rd-empty">Sé el primero en comentar</p>
        ) : (
          comentarios.map((c) => {
            const usuario = c.usuarios
              ? `${c.usuarios.nombre}_${c.usuarios.apellido_paterno}`
              : `usuario_${c.id_comentario}`;
            return (
              <div key={c.id_comentario} className="rd-comment-card">
                <div className="rd-comment-header">
                  <span className="rd-comment-user">{usuario}</span>
                  <span className="rd-comment-time">{tiempoRelativo(c.fecha_comentario)}</span>
                </div>
                <p className="rd-comment-text">{c.comentario}</p>
              </div>
            );
          })
        )}

        {/* Espacio para que el input fijo no tape el último comentario */}
        <div style={{ height: '80px' }} />
      </div>
    );
  };

  return (
    <>
      <style>{`
        .rd-page {
          background: #F5A623;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          width: 100%;
          box-sizing: border-box;
        }
        .rd-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: clamp(12px, 2.5vw, 16px) clamp(14px, 3vw, 20px);
          flex-shrink: 0;
        }
        .rd-back-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #fff;
          display: flex;
          align-items: center;
          padding: 4px;
          flex-shrink: 0;
        }
        .rd-header-title {
          font-size: clamp(15px, 4vw, 18px);
          font-weight: 700;
          color: #fff;
        }
        .rd-map {
          width: 100%;
          height: clamp(150px, 25vw, 210px);
          background: rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .rd-map-text {
          font-size: 12px;
          color: rgba(255,255,255,0.55);
        }
        .rd-body {
          padding: clamp(14px, 3vw, 20px) clamp(14px, 4vw, 24px) 0;
          flex: 1;
        }
        .rd-title {
          font-size: clamp(18px, 5vw, 24px);
          font-weight: 700;
          color: #fff;
          margin: 0 0 5px;
          line-height: 1.2;
        }
        .rd-meta {
          font-size: clamp(12px, 2.5vw, 14px);
          color: rgba(255,255,255,0.85);
          margin: 0 0 12px;
        }
        .rd-desc {
          font-size: clamp(13px, 3vw, 15px);
          color: #fff;
          line-height: 1.6;
          margin: 0 0 20px;
        }
        .rd-vote-label {
          font-size: clamp(14px, 3.5vw, 17px);
          font-weight: 700;
          color: #fff;
          margin: 0 0 10px;
        }
        .rd-vote-row {
          display: flex;
          gap: clamp(8px, 2vw, 12px);
          margin-bottom: 24px;
        }
        .rd-btn-activo, .rd-btn-inactivo {
          flex: 1;
          padding: clamp(10px, 2.5vw, 14px);
          border-radius: 10px;
          border: none;
          font-size: clamp(13px, 3vw, 15px);
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: opacity .15s;
        }
        .rd-btn-activo  { background: #1A1B3A; color: #fff; }
        .rd-btn-inactivo { background: #fff;    color: #1A1B3A; }
        .rd-btn-activo:disabled, .rd-btn-inactivo:disabled { opacity: 0.6; cursor: not-allowed; }
        .rd-comments-title {
          font-size: clamp(14px, 3.5vw, 17px);
          font-weight: 700;
          color: #fff;
          text-align: center;
          margin: 0 0 12px;
        }
        .rd-empty {
          text-align: center;
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          padding: 12px 0;
          margin: 0;
        }
        .rd-comment-card {
          background: #fff;
          border-radius: 10px;
          padding: clamp(8px, 2vw, 12px) clamp(10px, 3vw, 16px);
          margin-bottom: 8px;
        }
        .rd-comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }
        .rd-comment-user {
          font-size: clamp(12px, 2.5vw, 14px);
          font-weight: 600;
          color: #1a1a1a;
        }
        .rd-comment-time {
          font-size: clamp(10px, 2vw, 12px);
          color: #aaa;
        }
        .rd-comment-text {
          font-size: clamp(12px, 2.5vw, 14px);
          color: #555;
          line-height: 1.4;
          margin: 0;
        }
        .rd-input-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #fff;
          padding: clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px);
          display: flex;
          gap: 8px;
          align-items: center;
          border-top: 0.5px solid #eee;
          box-sizing: border-box;
          z-index: 100;
        }
        .rd-comment-input {
          flex: 1;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: clamp(9px, 2vw, 12px) clamp(10px, 2.5vw, 14px);
          font-size: clamp(13px, 3vw, 15px);
          outline: none;
          color: #333;
          background: #fafafa;
          font-family: inherit;
          min-width: 0;
        }
        .rd-comment-input:focus { border-color: #F5A623; }
        .rd-send-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .rd-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .rd-center {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 24px;
        }
        .rd-back-link {
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          font-size: 14px;
          font-family: inherit;
        }
      `}</style>

      <div className="rd-page">
        <div className="rd-header">
          <button className="rd-back-btn" onClick={onBack}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <span className="rd-header-title">Detalle Reporte</span>
        </div>

        {/* TODO: Mayki integrará su MapView aquí */}
        <div className="rd-map">
          {reporte && (
            <span className="rd-map-text">
              {reporte.ubicaciones.direccion
                ?? `${reporte.ubicaciones.latitud.toFixed(4)}, ${reporte.ubicaciones.longitud.toFixed(4)}`}
            </span>
          )}
        </div>

        {renderContent()}

        <div className="rd-input-bar">
          <input
            className="rd-comment-input"
            placeholder="Agregar Comentario..."
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEnviar()}
            disabled={enviando}
          />
          <button className="rd-send-btn" onClick={handleEnviar} disabled={enviando}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}