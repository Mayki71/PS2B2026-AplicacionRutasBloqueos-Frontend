import type { Reporte } from '../reports.types';
import { buildTituloReporte, tiempoRelativo } from '../reports.types';

interface Props {
  reporte: Reporte;
  onVerDetalle: (id: number) => void;
  onClose: () => void;
}

const S = {
  sheet: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 900,
    background: '#F5A623',
    borderRadius: '20px 20px 0 0',
    padding: '20px 20px 28px',
    boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#22C55E',
    flexShrink: 0,
  },
  title: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#fff',
  },
  meta: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: '8px',
  },
  desc: {
    fontSize: '13px',
    color: '#fff',
    lineHeight: 1.5,
    marginBottom: '16px',
  },
  btns: {
    display: 'flex',
    gap: '10px',
  },
  btnDetalle: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1A1B3A',
    cursor: 'pointer',
  },
  btnEvitar: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: '#1A1B3A',
    border: 'none',
    borderRadius: '10px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
    cursor: 'not-allowed', // no es nuestro módulo
    opacity: 0.7,
  },
};

export default function ReportPopup({ reporte, onVerDetalle, onClose }: Props) {
  const titulo = buildTituloReporte(reporte);
  const hace = tiempoRelativo(reporte.fecha_creacion);
  const totalVotos = reporte.votos.total;

  return (
    <>
      {/* tap fuera para cerrar */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 899 }}
      />
      <div style={S.sheet}>
        <div style={S.row}>
          <div style={S.titleRow}>
            <span style={S.dot} />
            <span style={S.title}>{titulo}</span>
          </div>
        </div>

        <p style={S.meta}>
          {hace} · {totalVotos} votos
        </p>

        <p style={S.desc}>{reporte.descripcion}</p>

        <div style={S.btns}>
          <button
            style={S.btnDetalle}
            onClick={() => onVerDetalle(reporte.id_reporte)}
          >
            {/* ícono lupa */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Ver Detalle
          </button>

          {/* Evitar Zona: no es nuestro módulo — solo UI */}
          <button style={S.btnEvitar} disabled title="Funcionalidad del módulo Map">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
            Evitar Zona
          </button>
        </div>
      </div>
    </>
  );
}