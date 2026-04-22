import { useMisReportes } from '../hooks/useReports';
import { buildTituloReporte } from '../reports.types';

interface Props {
  onSelectReporte: (id: number) => void;
  onClose: () => void;
}

const S = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.35)',
  },
  modal: {
    background: '#F5A623',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '440px',
    margin: '0 16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  },
  header: {
    padding: '18px 20px 14px',
    textAlign: 'center' as const,
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#fff',
  },
  listContainer: {
    background: 'rgba(255,255,255,0.15)',
    margin: '0 12px 16px',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#fff',
    margin: '0 0 2px',
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'background .1s',
  },
  itemFirst: {
    borderRadius: '10px 10px 0 0',
  },
  itemLast: {
    borderRadius: '0 0 10px 10px',
    marginBottom: 0,
  },
  num: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#999',
    minWidth: '20px',
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1a1a1a',
    marginBottom: '2px',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemDesc: {
    fontSize: '12px',
    color: '#888',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chevron: {
    color: '#ccc',
    flexShrink: 0,
  },
  emptyMsg: {
    textAlign: 'center' as const,
    padding: '24px',
    color: '#fff',
    fontSize: '14px',
  },
};

export default function ReportList({ onSelectReporte, onClose }: Props) {
  const { misReportes, loading, error } = useMisReportes();

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.header}>
          <p style={S.headerTitle}>Tus Reportes</p>
        </div>

        {loading && (
          <div style={S.emptyMsg}>Cargando...</div>
        )}

        {error && (
          <div style={S.emptyMsg}>{error}</div>
        )}

        {!loading && !error && misReportes.length === 0 && (
          <div style={S.emptyMsg}>No tienes reportes aún.</div>
        )}

        {!loading && misReportes.length > 0 && (
          <div style={S.listContainer}>
            {misReportes.map((r, i) => {
              const titulo = buildTituloReporte(r as any);
              const isFirst = i === 0;
              const isLast  = i === misReportes.length - 1;

              return (
                <div
                  key={r.id_reporte}
                  style={{
                    ...S.item,
                    ...(isFirst ? S.itemFirst : {}),
                    ...(isLast  ? S.itemLast  : {}),
                  }}
                  onClick={() => onSelectReporte(r.id_reporte)}
                >
                  <span style={S.num}>{i + 1}</span>
                  <div style={S.itemBody}>
                    <p style={S.itemTitle}>{titulo}</p>
                    <p style={S.itemDesc}>{r.descripcion}</p>
                  </div>
                  <svg style={S.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}