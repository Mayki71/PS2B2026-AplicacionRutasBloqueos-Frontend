import type { Reporte } from '../reports.types';
import { buildTituloReporte, tiempoRelativo } from '../reports.types';

interface Props {
  reporte: Reporte;
  onVerDetalle: (id: number) => void;
  onClose: () => void;
}

export default function ReportPopup({ reporte, onVerDetalle, onClose }: Props) {
  const titulo     = buildTituloReporte(reporte);
  const hace       = tiempoRelativo(reporte.fecha_creacion);
  const totalVotos = reporte.votos.total;

  return (
    <>
      <style>{`
        .rp-backdrop {
          position: fixed;
          inset: 0;
          z-index: 899;
        }
        .rp-sheet {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 900;
          background: #F5A623;
          border-radius: 20px 20px 0 0;
          padding: clamp(16px, 3vw, 24px) clamp(16px, 4vw, 24px) clamp(20px, 4vw, 32px);
          box-shadow: 0 -4px 24px rgba(0,0,0,0.2);
        }
        .rp-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }
        .rp-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #22C55E;
          flex-shrink: 0;
        }
        .rp-title {
          font-size: clamp(15px, 4vw, 18px);
          font-weight: 700;
          color: #fff;
          margin: 0;
        }
        .rp-meta {
          font-size: clamp(11px, 2.5vw, 13px);
          color: rgba(255,255,255,0.85);
          margin: 0 0 8px;
        }
        .rp-desc {
          font-size: clamp(12px, 3vw, 14px);
          color: #fff;
          line-height: 1.5;
          margin: 0 0 16px;
        }
        .rp-btns {
          display: flex;
          gap: clamp(8px, 2vw, 12px);
        }
        .rp-btn-detalle {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #fff;
          border: none;
          border-radius: 10px;
          padding: clamp(10px, 2.5vw, 14px);
          font-size: clamp(12px, 3vw, 15px);
          font-weight: 600;
          color: #1A1B3A;
          cursor: pointer;
          font-family: inherit;
        }
        .rp-btn-evitar {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #1A1B3A;
          border: none;
          border-radius: 10px;
          padding: clamp(10px, 2.5vw, 14px);
          font-size: clamp(12px, 3vw, 15px);
          font-weight: 600;
          color: #fff;
          cursor: not-allowed;
          opacity: 0.65;
          font-family: inherit;
        }
      `}</style>

      <div className="rp-backdrop" onClick={onClose} />
      <div className="rp-sheet">
        <div className="rp-title-row">
          <span className="rp-dot" />
          <p className="rp-title">{titulo}</p>
        </div>
        <p className="rp-meta">{hace} · {totalVotos} votos</p>
        <p className="rp-desc">{reporte.descripcion}</p>

        <div className="rp-btns">
          <button className="rp-btn-detalle" onClick={() => onVerDetalle(reporte.id_reporte)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Ver Detalle
          </button>
          <button className="rp-btn-evitar" disabled title="Funcionalidad del módulo Map">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
            Evitar Zona
          </button>
        </div>
      </div>
    </>
  );
}