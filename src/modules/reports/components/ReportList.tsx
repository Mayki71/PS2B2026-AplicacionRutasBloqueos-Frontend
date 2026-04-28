import { useMisReportes } from '../hooks/useReports';
import { buildTituloReporte } from '../reports.types';

interface Props {
  onSelectReporte: (id: number) => void;
  onClose: () => void;
}

export default function ReportList({ onSelectReporte, onClose }: Props) {
  const { misReportes, loading, error } = useMisReportes();

  return (
    <>
      <style>{`
        .rl-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.4);
          padding: 16px;
          box-sizing: border-box;
        }
        .rl-modal {
          background: #F5A623;
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          overflow: hidden;
        }
        .rl-header {
          padding: 18px 20px 14px;
          text-align: center;
          flex-shrink: 0;
        }
        .rl-title {
          font-size: clamp(16px, 4vw, 20px);
          font-weight: 700;
          color: #fff;
          margin: 0;
        }
        .rl-list {
          overflow-y: auto;
          padding: 0 12px 16px;
          flex: 1;
        }
        .rl-list-inner {
          background: rgba(255,255,255,0.15);
          border-radius: 12px;
          overflow: hidden;
        }
        .rl-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff;
          padding: clamp(12px, 2.5vw, 16px);
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          transition: background .1s;
        }
        .rl-item:last-child { border-bottom: none; }
        .rl-item:hover { background: #f9f9f9; }
        .rl-item:first-child { border-radius: 12px 12px 0 0; }
        .rl-item:last-child  { border-radius: 0 0 12px 12px; }
        .rl-item:only-child  { border-radius: 12px; }
        .rl-num {
          font-size: 14px;
          font-weight: 700;
          color: #bbb;
          min-width: 22px;
          flex-shrink: 0;
        }
        .rl-body { flex: 1; min-width: 0; }
        .rl-item-title {
          font-size: clamp(13px, 3vw, 15px);
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rl-item-desc {
          font-size: clamp(11px, 2.5vw, 13px);
          color: #888;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rl-chevron { color: #ccc; flex-shrink: 0; }
        .rl-msg {
          text-align: center;
          padding: 24px;
          color: #fff;
          font-size: 14px;
        }
      `}</style>

      <div className="rl-overlay" onClick={onClose}>
        <div className="rl-modal" onClick={(e) => e.stopPropagation()}>
          <div className="rl-header">
            <p className="rl-title">Tus Reportes</p>
          </div>

          <div className="rl-list">
            {loading && <p className="rl-msg">Cargando...</p>}
            {error   && <p className="rl-msg">{error}</p>}
            {!loading && !error && misReportes.length === 0 && (
              <p className="rl-msg">No tienes reportes aún.</p>
            )}
            {!loading && misReportes.length > 0 && (
              <div className="rl-list-inner">
                {misReportes.map((r, i) => (
                  <div key={r.id_reporte} className="rl-item"
                    onClick={() => onSelectReporte(r.id_reporte)}>
                    <span className="rl-num">{i + 1}</span>
                    <div className="rl-body">
                      <p className="rl-item-title">{buildTituloReporte(r as any)}</p>
                      <p className="rl-item-desc">{r.descripcion}</p>
                    </div>
                    <svg className="rl-chevron" width="16" height="16" viewBox="0 0 24 24"
                      fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}