import { useState, useEffect } from 'react';
import { useCreateReporte } from '../hooks/useReports';
import { getTiposBloqueo } from '../services/reportsService';
import type { TipoBloqueo } from '../reports.types';

interface Props {
  latitud?: number;
  longitud?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReportForm({ latitud, longitud, onClose, onSuccess }: Props) {
  const [tiposBloqueo, setTiposBloqueo] = useState<TipoBloqueo[]>([]);
  const [form, setForm] = useState({
    id_tipo_bloqueo: '',
    descripcion: '',
    comentario_inicial: '',
    imagen_url: '',
    latitud: latitud?.toString() ?? '',
    longitud: longitud?.toString() ?? '',
    direccion: '',
  });

  const { crearReporte, loading, error, success } = useCreateReporte();

  useEffect(() => { getTiposBloqueo().then(setTiposBloqueo); }, []);
  useEffect(() => { if (success) { onSuccess?.(); onClose(); } }, [success]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.id_tipo_bloqueo || !form.descripcion || !form.latitud || !form.longitud) return;
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
    <>
      <style>{`
        .rf-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.45);
          padding: 16px;
          box-sizing: border-box;
        }
        .rf-modal {
          background: #F5A623;
          border-radius: 16px;
          padding: 24px 20px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          max-height: 90vh;
          overflow-y: auto;
          box-sizing: border-box;
        }
        .rf-title {
          color: #fff;
          font-size: clamp(16px, 4vw, 20px);
          font-weight: 700;
          text-align: center;
          margin: 0 0 18px;
        }
        .rf-card {
          background: #fff;
          border-radius: 12px;
          padding: clamp(14px, 3vw, 20px);
        }
        .rf-label {
          font-size: 13px;
          font-weight: 500;
          color: #333;
          margin-bottom: 5px;
          display: block;
        }
        .rf-input {
          width: 100%;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          color: #333;
          margin-bottom: 12px;
          outline: none;
          background: #fafafa;
          box-sizing: border-box;
          font-family: inherit;
        }
        .rf-input:focus { border-color: #F5A623; }
        .rf-textarea {
          width: 100%;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          color: #333;
          margin-bottom: 12px;
          outline: none;
          background: #fafafa;
          box-sizing: border-box;
          resize: vertical;
          min-height: 75px;
          font-family: inherit;
        }
        .rf-textarea:focus { border-color: #F5A623; }
        .rf-coords-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .rf-coords-hint {
          font-size: 11px;
          color: #999;
          text-align: center;
          margin: 4px 0 12px;
          font-style: italic;
        }
        .rf-error {
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12px;
          color: #c00;
          margin-bottom: 10px;
        }
        .rf-btn {
          width: 100%;
          background: #1A1B3A;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 4px;
          font-family: inherit;
          transition: opacity .15s;
        }
        .rf-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="rf-overlay" onClick={onClose}>
        <div className="rf-modal" onClick={(e) => e.stopPropagation()}>
          <p className="rf-title">Datos de tu Reporte</p>
          <div className="rf-card">
            {error && <div className="rf-error">{error}</div>}

            <label className="rf-label">Situacion</label>
            <select name="id_tipo_bloqueo" value={form.id_tipo_bloqueo} onChange={handleChange} className="rf-input">
              <option value="">Bloqueo, Feria, Accidente, etc</option>
              {tiposBloqueo.map((t) => (
                <option key={t.id_tipo_bloqueo} value={t.id_tipo_bloqueo}>{t.nombre}</option>
              ))}
            </select>

            <label className="rf-label">Pruebas</label>
            <input type="text" name="imagen_url" value={form.imagen_url} onChange={handleChange}
              placeholder="URL de foto del incidente (opcional)" className="rf-input" />

            <label className="rf-label">Descripcion</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
              placeholder="Comentanos acerca del incidente" className="rf-textarea" />

            <label className="rf-label">Comentarios</label>
            <textarea name="comentario_inicial" value={form.comentario_inicial} onChange={handleChange}
              placeholder="Deja un comentario para los demas usuarios de la plataforma"
              className="rf-textarea" style={{ minHeight: '65px' }} />

            <label className="rf-label">Coordenadas</label>
            {/* TODO: estas coordenadas vendrán del mapa de Mayki como props */}
            <div className="rf-coords-row">
              <input type="number" name="latitud" value={form.latitud} onChange={handleChange}
                placeholder="Latitud" className="rf-input" style={{ marginBottom: 0 }} />
              <input type="number" name="longitud" value={form.longitud} onChange={handleChange}
                placeholder="Longitud" className="rf-input" style={{ marginBottom: 0 }} />
            </div>
            <p className="rf-coords-hint">
              {form.latitud && form.longitud
                ? `Coordenadas: ${form.latitud}, ${form.longitud}`
                : 'Ingresa las coordenadas del incidente'}
            </p>

            <label className="rf-label">Dirección (opcional)</label>
            <input type="text" name="direccion" value={form.direccion} onChange={handleChange}
              placeholder="Ej: Av. Argentina esquina Calle 5" className="rf-input" />

            <button className="rf-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}