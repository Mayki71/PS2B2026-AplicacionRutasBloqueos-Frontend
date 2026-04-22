import { useState, useEffect } from 'react';
import { useCreateReporte } from '../hooks/useReports';
import { getTiposBloqueo } from '../services/reportsService';
import type { TipoBloqueo } from '../reports.types';

interface Props {
  // TODO: Cuando Mayki integre el mapa, pasará las coordenadas aquí
  latitud?: number;
  longitud?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const S = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.4)',
  },
  modal: {
    background: '#F5A623',
    borderRadius: '16px',
    padding: '24px 20px',
    width: '100%',
    maxWidth: '420px',
    margin: '0 16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  title: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: 600,
    textAlign: 'center' as const,
    marginBottom: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '16px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#333',
    marginBottom: '6px',
    display: 'block',
  },
  input: {
    width: '100%',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    color: '#333',
    marginBottom: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    background: '#fafafa',
  },
  textarea: {
    width: '100%',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    color: '#333',
    marginBottom: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    background: '#fafafa',
    resize: 'vertical' as const,
    minHeight: '80px',
  },
  coords: {
    fontSize: '11px',
    color: '#888',
    textAlign: 'center' as const,
    marginTop: '4px',
    marginBottom: '16px',
    fontStyle: 'italic',
  },
  btnEnviar: {
    width: '100%',
    background: '#1A1B3A',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'opacity .15s',
  },
  errorMsg: {
    background: '#fee',
    border: '1px solid #fcc',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '12px',
    color: '#c00',
    marginBottom: '10px',
  },
};

export default function ReportForm({ latitud, longitud, onClose, onSuccess }: Props) {
  const [tiposBloqueo, setTiposBloqueo] = useState<TipoBloqueo[]>([]);
  const [form, setForm] = useState({
    id_tipo_bloqueo: '',
    descripcion: '',
    comentario_inicial: '',
    imagen_url: '',
    // TODO: cuando Mayki pase las coords por props, estos campos
    // se llenarán automáticamente. Por ahora son editables.
    latitud: latitud?.toString() ?? '',
    longitud: longitud?.toString() ?? '',
    direccion: '',
  });

  const { crearReporte, loading, error, success } = useCreateReporte();

  useEffect(() => {
    getTiposBloqueo().then(setTiposBloqueo);
  }, []);

  useEffect(() => {
    if (success) {
      onSuccess?.();
      onClose();
    }
  }, [success]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.id_tipo_bloqueo || !form.descripcion || !form.latitud || !form.longitud) {
      return;
    }
    await crearReporte({
      id_tipo_bloqueo: Number(form.id_tipo_bloqueo),
      descripcion: form.descripcion,
      latitud: Number(form.latitud),
      longitud: Number(form.longitud),
      direccion: form.direccion || undefined,
      comentario_inicial: form.comentario_inicial || undefined,
      imagen_url: form.imagen_url || undefined,
    });
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <p style={S.title}>Datos de tu Reporte</p>

        <div style={S.card}>
          {error && <div style={S.errorMsg}>{error}</div>}

          {/* Situación */}
          <label style={S.label}>Situacion</label>
          <select
            name="id_tipo_bloqueo"
            value={form.id_tipo_bloqueo}
            onChange={handleChange}
            style={S.input}
          >
            
            {tiposBloqueo.map((t) => (
              <option key={t.id_tipo_bloqueo} value={t.id_tipo_bloqueo}>
                {t.nombre}
              </option>
            ))}
          </select>

          {/* Pruebas (imagen) */}
          <label style={S.label}>Pruebas</label>
          <input
            type="text"
            name="imagen_url"
            value={form.imagen_url}
            onChange={handleChange}
            placeholder="Subir Foto del Incidente (URL)"
            style={S.input}
          />

          {/* Descripción */}
          <label style={S.label}>Descripcion</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Comentanos acerca del incidente"
            style={S.textarea}
          />

          {/* Comentario inicial */}
          <label style={S.label}>Comentarios</label>
          <textarea
            name="comentario_inicial"
            value={form.comentario_inicial}
            onChange={handleChange}
            placeholder="Deja un comentario para los demas usuarios de la plataforma"
            style={{ ...S.textarea, minHeight: '70px' }}
          />

          {/* Coordenadas */}
          {/* TODO: Estos inputs desaparecerán cuando Mayki pase las coords como props */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              name="latitud"
              value={form.latitud}
              onChange={handleChange}
              placeholder="Latitud"
              style={{ ...S.input, marginBottom: 0 }}
            />
            <input
              type="number"
              name="longitud"
              value={form.longitud}
              onChange={handleChange}
              placeholder="Longitud"
              style={{ ...S.input, marginBottom: 0 }}
            />
          </div>
          <p style={S.coords}>
            {form.latitud && form.longitud
              ? `Coordenadas Elegidas ~${form.latitud}, ${form.longitud}`
              : 'Ingresa las coordenadas o selecciona en el mapa'}
          </p>

          <input
            type="text"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            placeholder="Dirección o referencia (opcional)"
            style={S.input}
          />

          <button
            style={{ ...S.btnEnviar, opacity: loading ? 0.6 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}