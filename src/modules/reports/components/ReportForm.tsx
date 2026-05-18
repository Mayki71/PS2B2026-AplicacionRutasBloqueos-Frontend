import { useState, useEffect, useRef } from 'react';
import { useCreateReporte } from '../hooks/useReports';
import { getTiposBloqueo } from '../services/reportsService';
import type { TipoBloqueo } from '../reports.types';
import { supabase } from '../../../services/supabaseClient';
import { getTipoIcono } from '../../../utils/blockageIcons';
import { CheckCircle, MapPin, ChevronRight, ChevronLeft, Camera, FileText, MapPinned, Clock } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.MAPBOX_TOKEN;

interface Props {
  coordsA?: [number, number] | null;
  coordsB?: [number, number] | null;
  initialDireccion?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

async function reverseGeocode(lng: number, lat: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,neighborhood&language=es&limit=1`
    );
    const data = await res.json();
    if (data.features?.length > 0)
      return data.features[0].text || data.features[0].place_name.split(',')[0];
  } catch { /* silencioso */ }
  return '';
}

const STEPS = [
  { id: 1, label: 'Tipo',       icon: MapPinned },
  { id: 2, label: 'Evidencia',  icon: Camera    },
  { id: 3, label: 'Detalle',    icon: FileText  },
  { id: 4, label: 'Confirmar',  icon: Clock     },
];

export default function ReportForm({ coordsA, coordsB, initialDireccion, onClose, onSuccess }: Props) {
  const [step, setStep]                     = useState(1);
  const [tiposBloqueo, setTiposBloqueo]     = useState<TipoBloqueo[]>([]);
  const [tipoSeleccionado, setTipo]         = useState<number | null>(null);
  const [descripcion, setDescripcion]       = useState('');
  const [direccion, setDireccion]           = useState(initialDireccion ?? '');
  const [imageFile, setImageFile]           = useState<File | null>(null);
  const [imagePreview, setPreview]          = useState<string | null>(null);
  const [uploading, setUploading]           = useState(false);
  const fileRef                             = useRef<HTMLInputElement>(null);

  const now       = new Date();
  const fechaAuto = now.toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
  const horaAuto  = now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

  const { crearReporte, loading, error, success } = useCreateReporte();

  useEffect(() => { getTiposBloqueo().then(setTiposBloqueo); }, []);
  useEffect(() => { if (success) { onSuccess?.(); onClose(); } }, [success]);
  useEffect(() => {
    if (coordsA && !initialDireccion)
      reverseGeocode(coordsA[0], coordsA[1]).then(c => { if (c) setDireccion(c); });
  }, [coordsA]);
  useEffect(() => { if (initialDireccion) setDireccion(initialDireccion); }, [initialDireccion]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const ext      = file.name.split('.').pop();
      const fileName = `report_${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('reportes-imagenes')
        .upload(fileName, file, { contentType: file.type, upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('reportes-imagenes').getPublicUrl(fileName);
      return urlData.publicUrl;
    } catch (e) { console.error('Error subiendo imagen:', e); return null; }
    finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!tipoSeleccionado || !descripcion.trim() || !coordsA) return;
    let imagen_url: string | undefined;
    if (imageFile) { const url = await uploadImage(imageFile); if (url) imagen_url = url; }
    const tituloDesc = direccion ? `Bloqueo en ${direccion}: ${descripcion}` : descripcion;
    await crearReporte({
      id_tipo_bloqueo: tipoSeleccionado,
      descripcion: tituloDesc,
      latitud:      coordsA[1], longitud:     coordsA[0],
      latitud_fin:  coordsB ? coordsB[1] : undefined,
      longitud_fin: coordsB ? coordsB[0] : undefined,
      direccion:    direccion || undefined,
      imagen_url,
    } as any);
  };

  const tipoActual   = tiposBloqueo.find(t => t.id_tipo_bloqueo === tipoSeleccionado);
  const canNext1     = !!tipoSeleccionado;
  const canNext3     = !!descripcion.trim() && !!coordsA;
  const puedeEnviar  = canNext1 && canNext3;

  const canGoNext = () => {
    if (step === 1) return canNext1;
    if (step === 3) return canNext3;
    return true;
  };

  return (
    <>
      <style>{`
        .rf2-root {
          display: flex; flex-direction: column; height: 100%;
          background: #FCA311; overflow: hidden;
        }

        /* ── Header con progreso ── */
        .rf2-header {
          background: #FCA311;
          padding: 16px 20px 0;
          flex-shrink: 0;
        }
        .rf2-steps {
          display: flex; align-items: center;
          gap: 0; margin-bottom: 0;
        }
        .rf2-step-item {
          display: flex; flex-direction: column; align-items: center;
          gap: 6px; flex: 1; position: relative;
        }
        .rf2-step-item:not(:last-child)::after {
          content: '';
          position: absolute; top: 16px; left: 55%; right: -45%;
          height: 2px; background: rgba(20,33,61,0.2);
          z-index: 0;
        }
        .rf2-step-item.done:not(:last-child)::after { background: #14213D; }
        .rf2-step-circle {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid rgba(20,33,61,0.25);
          background: transparent; color: rgba(20,33,61,0.4);
          font-size: 12px; font-weight: 700;
          transition: all 0.25s; z-index: 1; position: relative;
        }
        .rf2-step-item.active .rf2-step-circle {
          border-color: #14213D; background: #14213D;
          color: #FCA311; box-shadow: 0 0 0 4px rgba(20,33,61,0.2);
        }
        .rf2-step-item.done .rf2-step-circle {
          border-color: #14213D; background: transparent; color: #14213D;
        }
        .rf2-step-label {
          font-size: 10px; font-weight: 700; color: rgba(20,33,61,0.4);
          text-transform: uppercase; letter-spacing: 0.5px;
          transition: color 0.25s;
        }
        .rf2-step-item.active .rf2-step-label { color: #14213D; }
        .rf2-step-item.done  .rf2-step-label  { color: rgba(20,33,61,0.6); }

        /* ── Estado mapa ── */
        .rf2-map-bar {
          display: flex; align-items: center; gap: 8px;
          background: rgba(20,33,61,0.12);
          border: 1px solid rgba(20,33,61,0.2);
          border-radius: 10px; padding: 10px 14px;
          margin: 14px 20px 0;
        }
        .rf2-dot {
          width: 24px; height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; color: #fff; flex-shrink: 0;
          transition: background 0.2s;
        }
        .rf2-dot-line { flex: 0 0 16px; height: 2px; background: rgba(20,33,61,0.15); border-radius: 1px; }
        .rf2-map-hint { font-size: 11px; color: #14213D; margin-left: 4px; display: flex; align-items: center; gap: 5px; font-weight: 600; opacity: 0.85; }

        /* ── Contenido del step ── */
        .rf2-body {
          flex: 1; overflow-y: auto; padding: 20px;
          display: flex; flex-direction: column; gap: 0;
        }

        .rf2-section-title {
          font-size: 22px; font-weight: 800; color: #14213D;
          margin: 0 0 4px; line-height: 1.2;
        }
        .rf2-section-sub {
          font-size: 13px; color: rgba(20,33,61,0.6);
          margin: 0 0 20px; font-weight: 500;
        }

        /* Step 1: tipos */
        .rf2-tipos-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
        }
        .rf2-tipo-card {
          display: flex; align-items: center; gap: 12px;
          padding: 14px; border-radius: 14px;
          background: rgba(255,255,255,0.5);
          border: 2px solid rgba(255,255,255,0.6);
          cursor: pointer; transition: all 0.18s;
        }
        .rf2-tipo-card:hover { border-color: #14213D; background: rgba(255,255,255,0.7); }
        .rf2-tipo-card.active { border-color: #14213D; background: #FFFFFF; }
        .rf2-tipo-icon-wrap {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(252,163,17,0.2);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .rf2-tipo-card.active .rf2-tipo-icon-wrap { background: rgba(20,33,61,0.08); }
        .rf2-tipo-info { flex: 1; min-width: 0; }
        .rf2-tipo-name { font-size: 13px; font-weight: 700; color: #14213D; }
        .rf2-tipo-check {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(20,33,61,0.25);
          flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          transition: all 0.18s;
        }
        .rf2-tipo-card.active .rf2-tipo-check { background: #14213D; border-color: #14213D; }

        /* Step 2: imagen */
        .rf2-photo-drop {
          width: 100%; min-height: 160px;
          background: rgba(255,255,255,0.4);
          border: 2px dashed rgba(20,33,61,0.3);
          border-radius: 16px; cursor: pointer;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s; box-sizing: border-box; padding: 20px;
        }
        .rf2-photo-drop:hover { border-color: #14213D; background: rgba(255,255,255,0.55); }
        .rf2-photo-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: rgba(20,33,61,0.1);
          display: flex; align-items: center; justify-content: center;
        }
        .rf2-photo-text { font-size: 15px; font-weight: 700; color: #14213D; }
        .rf2-photo-sub  { font-size: 12px; color: rgba(20,33,61,0.5); text-align: center; }
        .rf2-preview-wrap {
          position: relative; border-radius: 16px; overflow: hidden;
          background: rgba(255,255,255,0.3); max-height: 200px;
          display: flex; justify-content: center;
        }
        .rf2-preview-img { width: 100%; max-height: 200px; object-fit: contain; }
        .rf2-remove-btn {
          position: absolute; top: 10px; right: 10px;
          background: rgba(20,33,61,0.75); border: none; color: #fff;
          border-radius: 50%; width: 30px; height: 30px;
          cursor: pointer; font-size: 14px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .rf2-skip-btn {
          width: 100%; padding: 12px; margin-top: 12px;
          background: transparent;
          border: 1px solid rgba(20,33,61,0.25);
          border-radius: 10px; color: rgba(20,33,61,0.6);
          font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: inherit; transition: all 0.15s;
        }
        .rf2-skip-btn:hover { border-color: #14213D; color: #14213D; }

        /* Step 3: detalle */
        .rf2-field-label {
          font-size: 11px; font-weight: 700; color: #14213D;
          text-transform: uppercase; letter-spacing: 0.7px; margin: 0 0 7px;
        }
        .rf2-textarea, .rf2-input {
          width: 100%; padding: 13px 16px;
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(20,33,61,0.15);
          border-radius: 12px; color: #14213D;
          font-size: 14px; font-family: inherit; outline: none;
          box-sizing: border-box; transition: border-color 0.15s;
          margin-bottom: 16px;
        }
        .rf2-textarea { resize: vertical; min-height: 90px; }
        .rf2-textarea:focus, .rf2-input:focus { border-color: #14213D; background: #FFFFFF; }
        .rf2-input:last-child, .rf2-textarea:last-child { margin-bottom: 0; }
        ::placeholder { color: rgba(20,33,61,0.35); }

        /* Step 4: confirmar */
        .rf2-confirm-card {
          background: rgba(255,255,255,0.5);
          border: 1px solid rgba(20,33,61,0.1);
          border-radius: 16px; overflow: hidden; margin-bottom: 12px;
        }
        .rf2-confirm-row {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(20,33,61,0.07);
        }
        .rf2-confirm-row:last-child { border-bottom: none; }
        .rf2-confirm-icon {
          width: 34px; height: 34px; border-radius: 9px;
          background: rgba(20,33,61,0.1);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .rf2-confirm-key { font-size: 11px; color: rgba(20,33,61,0.45); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
        .rf2-confirm-val { font-size: 14px; color: #14213D; font-weight: 600; line-height: 1.4; }
        .rf2-confirm-val.accent { color: #14213D; font-weight: 800; }

        .rf2-fecha-row { display: flex; gap: 10px; }
        .rf2-fecha-field { flex: 1; }
        .rf2-input-readonly {
          width: 100%; padding: 11px 14px;
          background: rgba(255,255,255,0.35);
          border: 1px solid rgba(20,33,61,0.1);
          border-radius: 10px; color: rgba(20,33,61,0.55);
          font-size: 13px; font-weight: 600; outline: none;
          box-sizing: border-box; cursor: not-allowed;
        }

        /* ── Footer con navegación ── */
        .rf2-footer {
          flex-shrink: 0; padding: 14px 20px 20px;
          background: #FCA311;
          border-top: 1px solid rgba(20,33,61,0.12);
          display: flex; gap: 10px;
        }
        .rf2-btn-back {
          flex: 0 0 auto; padding: 14px 18px;
          background: rgba(20,33,61,0.12);
          border: 1px solid rgba(20,33,61,0.2);
          border-radius: 12px; color: #14213D;
          font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: inherit; display: flex; align-items: center; gap: 6px;
          transition: all 0.15s;
        }
        .rf2-btn-back:hover { background: rgba(20,33,61,0.18); }
        .rf2-btn-next {
          flex: 1; padding: 14px;
          background: #14213D; border: none; border-radius: 12px;
          color: #FCA311; font-size: 15px; font-weight: 800;
          cursor: pointer; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 20px rgba(20,33,61,0.35);
        }
        .rf2-btn-next:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(20,33,61,0.45); }
        .rf2-btn-next:disabled { opacity: 0.35; cursor: not-allowed; }

        .rf2-error {
          color: #7f1d1d; font-size: 13px; font-weight: 600;
          text-align: center; padding: 10px 14px;
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px; margin-bottom: 10px;
        }
      `}</style>

      <div className="rf2-root">

        {/* ── Header: steps + mapa ──────────────────────────── */}
        <div className="rf2-header">
          <div className="rf2-steps">
            {STEPS.map((s) => {
              const Icon     = s.icon;
              const isActive = step === s.id;
              const isDone   = step > s.id;
              return (
                <div key={s.id} className={`rf2-step-item${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}>
                  <div className="rf2-step-circle">
                    {isDone
                      ? <CheckCircle size={14} />
                      : <Icon size={14} />}
                  </div>
                  <span className="rf2-step-label">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estado del mapa */}
        <div className="rf2-map-bar">
          <div className="rf2-dot" style={{ background: coordsA ? '#22c55e' : 'rgba(229,229,229,0.15)' }}>A</div>
          <div className="rf2-dot-line" />
          <div className="rf2-dot" style={{ background: coordsB ? '#ef4444' : 'rgba(229,229,229,0.15)' }}>B</div>
          <span className="rf2-map-hint">
            {!coordsA
              ? <><MapPin size={12} color="#FCA311" /> Marca el punto A en el mapa</>
              : !coordsB
              ? <><MapPin size={12} color="#FCA311" /> Marca el punto B en el mapa</>
              : <><CheckCircle size={12} color="#22c55e" /> Tramo del bloqueo marcado</>}
          </span>
        </div>

        {/* ── Cuerpo: steps ─────────────────────────────────── */}
        <div className="rf2-body">

          {/* STEP 1 — Tipo de bloqueo */}
          {step === 1 && (
            <>
              <p className="rf2-section-title">¿Qué está pasando?</p>
              <p className="rf2-section-sub">Selecciona el tipo de incidente</p>
              <div className="rf2-tipos-grid">
                {tiposBloqueo.map(t => (
                  <div
                    key={t.id_tipo_bloqueo}
                    className={`rf2-tipo-card${tipoSeleccionado === t.id_tipo_bloqueo ? ' active' : ''}`}
                    onClick={() => setTipo(t.id_tipo_bloqueo)}
                  >
                    <div className="rf2-tipo-icon-wrap">
                      <img src={getTipoIcono(t.nombre)} style={{ width: 24, height: 24, objectFit: 'contain' }} alt="" />
                    </div>
                    <div className="rf2-tipo-info">
                      <p className="rf2-tipo-name">{t.nombre}</p>
                    </div>
                    <div className="rf2-tipo-check">
                      {tipoSeleccionado === t.id_tipo_bloqueo && (
                        <CheckCircle size={12} color="#14213D" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* STEP 2 — Imagen */}
          {step === 2 && (
            <>
              <p className="rf2-section-title">¿Tienes una foto?</p>
              <p className="rf2-section-sub">Ayuda a otros usuarios a entender mejor el incidente</p>

              {imagePreview ? (
                <div className="rf2-preview-wrap">
                  <img src={imagePreview} className="rf2-preview-img" alt="preview" />
                  <button className="rf2-remove-btn" onClick={() => { setImageFile(null); setPreview(null); }}>✕</button>
                </div>
              ) : (
                <div className="rf2-photo-drop" onClick={() => fileRef.current?.click()}>
                  <div className="rf2-photo-icon">
                    <Camera size={26} color="#FCA311" />
                  </div>
                  <p className="rf2-photo-text">Subir foto del incidente</p>
                  <p className="rf2-photo-sub">JPG, PNG · Toca para seleccionar</p>
                </div>
              )}

              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

              {!imagePreview && (
                <button className="rf2-skip-btn" onClick={() => setStep(3)}>
                  Continuar sin foto →
                </button>
              )}
            </>
          )}

          {/* STEP 3 — Descripción + ubicación */}
          {step === 3 && (
            <>
              <p className="rf2-section-title">Cuéntanos más</p>
              <p className="rf2-section-sub">Agrega los detalles del incidente</p>

              <p className="rf2-field-label">Descripción *</p>
              <textarea
                className="rf2-textarea"
                placeholder="¿Qué está pasando exactamente? ¿Qué tan grave es?"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                rows={4}
              />

              <p className="rf2-field-label">Ubicación / Calle</p>
              <input
                className="rf2-input"
                type="text"
                placeholder="Se rellena automáticamente desde el mapa"
                value={direccion}
                onChange={e => setDireccion(e.target.value)}
              />

              <div className="rf2-fecha-row">
                <div className="rf2-fecha-field">
                  <p className="rf2-field-label">Fecha</p>
                  <input className="rf2-input-readonly" type="text" value={fechaAuto} readOnly />
                </div>
                <div className="rf2-fecha-field">
                  <p className="rf2-field-label">Hora</p>
                  <input className="rf2-input-readonly" type="text" value={horaAuto} readOnly />
                </div>
              </div>
            </>
          )}

          {/* STEP 4 — Confirmar */}
          {step === 4 && (
            <>
              <p className="rf2-section-title">Todo listo</p>
              <p className="rf2-section-sub">Revisa los datos antes de publicar</p>

              <div className="rf2-confirm-card">
                <div className="rf2-confirm-row">
                  <div className="rf2-confirm-icon"><MapPinned size={18} color="#FCA311" /></div>
                  <div>
                    <p className="rf2-confirm-key">Tipo de incidente</p>
                    <p className="rf2-confirm-val accent">{tipoActual?.nombre ?? '—'}</p>
                  </div>
                </div>

                <div className="rf2-confirm-row">
                  <div className="rf2-confirm-icon"><FileText size={18} color="#FCA311" /></div>
                  <div>
                    <p className="rf2-confirm-key">Descripción</p>
                    <p className="rf2-confirm-val">{descripcion || '—'}</p>
                  </div>
                </div>

                <div className="rf2-confirm-row">
                  <div className="rf2-confirm-icon"><MapPin size={18} color="#FCA311" /></div>
                  <div>
                    <p className="rf2-confirm-key">Ubicación</p>
                    <p className="rf2-confirm-val">{direccion || (coordsA ? `${coordsA[1].toFixed(4)}, ${coordsA[0].toFixed(4)}` : '—')}</p>
                  </div>
                </div>

                <div className="rf2-confirm-row">
                  <div className="rf2-confirm-icon"><Camera size={18} color="#FCA311" /></div>
                  <div>
                    <p className="rf2-confirm-key">Imagen</p>
                    <p className="rf2-confirm-val">{imageFile ? imageFile.name : 'Sin imagen'}</p>
                  </div>
                </div>

                <div className="rf2-confirm-row">
                  <div className="rf2-confirm-icon"><Clock size={18} color="#FCA311" /></div>
                  <div>
                    <p className="rf2-confirm-key">Fecha y hora</p>
                    <p className="rf2-confirm-val">{fechaAuto} · {horaAuto}</p>
                  </div>
                </div>

                <div className="rf2-confirm-row">
                  <div className="rf2-confirm-icon">
                    <div style={{ display:'flex', gap:'4px' }}>
                      <div style={{ width:10,height:10,borderRadius:'50%', background: coordsA ? '#22c55e':'rgba(255,255,255,0.2)' }} />
                      <div style={{ width:10,height:10,borderRadius:'50%', background: coordsB ? '#ef4444':'rgba(255,255,255,0.2)' }} />
                    </div>
                  </div>
                  <div>
                    <p className="rf2-confirm-key">Tramo en el mapa</p>
                    <p className="rf2-confirm-val">{coordsA && coordsB ? 'Punto A y B marcados' : coordsA ? 'Solo punto A marcado' : 'Sin marcar'}</p>
                  </div>
                </div>
              </div>

              {error && <p className="rf2-error">{error}</p>}
            </>
          )}
        </div>

        {/* ── Footer: navegación ────────────────────────────── */}
        <div className="rf2-footer">
          {step > 1 && (
            <button className="rf2-btn-back" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft size={16} /> Atrás
            </button>
          )}

          {step < 4 ? (
            <button
              className="rf2-btn-next"
              onClick={() => setStep(s => s + 1)}
              disabled={!canGoNext()}
            >
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button
              className="rf2-btn-next"
              onClick={handleSubmit}
              disabled={!puedeEnviar || loading || uploading}
            >
              {uploading ? '⏳ Subiendo...' : loading ? '⏳ Publicando...' : '🚨 Publicar reporte'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}