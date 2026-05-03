import type { TipoBloqueo } from '../../reports/reports.types';
import { getTipoIcono, getTipoColor, ICONO_TODOS } from '../../../utils/blockageIcons';

interface BlockageFilterProps {
  tipos: TipoBloqueo[];
  activos: number[];        // ids actualmente visibles
  onChange: (ids: number[]) => void;
}

export default function BlockageFilter({ tipos, activos, onChange }: BlockageFilterProps) {
  const toggleTipo = (id: number) => {
    if (activos.includes(id)) {
      onChange(activos.filter(a => a !== id));
    } else {
      onChange([...activos, id]);
    }
  };

  const todosActivos = activos.length === 0;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 40,
      display: 'flex',
      gap: '6px',
      padding: '8px 12px',
      background: 'rgba(15,15,30,0.88)',
      backdropFilter: 'blur(12px)',
      borderRadius: '50px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      maxWidth: 'calc(100vw - 32px)',
      overflowX: 'auto',
    }}>

      {/* Botón "Todos" */}
      <button
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          padding: '6px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer',
          background: todosActivos ? '#FCA311' : 'rgba(255,255,255,0.1)',
          transition: 'all 0.15s', flexShrink: 0,
        }}
        onClick={() => onChange([])}
        title="Todos"
      >
        <img
          src={ICONO_TODOS}
          alt="Todos"
          style={{ width: '22px', height: '22px', objectFit: 'contain' }}
        />
        <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff', letterSpacing: '0.3px' }}>
          Todos
        </span>
      </button>

      {tipos.map(tipo => {
        const isActive = activos.includes(tipo.id_tipo_bloqueo);
        const icono = getTipoIcono(tipo.nombre);
        const color = getTipoColor(tipo.nombre);
        return (
          <button
            key={tipo.id_tipo_bloqueo}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              padding: '6px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              background: isActive ? color : 'rgba(255,255,255,0.1)',
              transition: 'all 0.15s', flexShrink: 0,
              opacity: (!todosActivos && !isActive) ? 0.4 : 1,
            }}
            onClick={() => toggleTipo(tipo.id_tipo_bloqueo)}
            title={tipo.nombre}
          >
            <img
              src={icono}
              alt={tipo.nombre}
              style={{
                width: '22px', height: '22px', objectFit: 'contain',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
              }}
            />
            <span style={{
              fontSize: '9px', fontWeight: 700, color: '#fff',
              letterSpacing: '0.3px', whiteSpace: 'nowrap',
            }}>
              {tipo.nombre.split(' ')[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
