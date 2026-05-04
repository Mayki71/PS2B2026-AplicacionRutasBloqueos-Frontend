import { useState, useEffect, useRef } from 'react';
import { useCreateReporte } from '../hooks/useReports';
import { getTiposBloqueo } from '../services/reportsService';
import type { TipoBloqueo } from '../reports.types';
import { supabase } from '../../../services/supabaseClient';
import { getTipoIcono } from '../../../utils/blockageIcons';
import { MapPin, CheckCircle, Navigation } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.MAPBOX_TOKEN;

interface Props {
  coordsA?: [number, number] | null;   // [lng, lat] — inicio del bloqueo
  coordsB?: [number, number] | null;   // [lng, lat] — fin del bloqueo
  initialDireccion?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

/** Reverse geocoding para obtener nombre de calle desde coords */
async function reverseGeocode(lng: number, lat: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,neighborhood&language=es&limit=1`
    );
    const data = await res.json();
    if (data.features?.length > 0) {
      return data.features[0].text || data.features[0].place_name.split(',')[0];
    }
  } catch { /* silencioso */ }
  return '';
}

export default function ReportForm({ coordsA, coordsB, initialDireccion, onClose, onSuccess }: Props) {
  const [tiposBloqueo, setTiposBloqueo]     = useState<TipoBloqueo[]>([]);
  const [tipoSeleccionado, setTipo]         = useState<number | null>(null);
  const [descripcion, setDescripcion]       = useState('');
  const [direccion, setDireccion]           = useState(initialDireccion ?? '');
  const [imageFile, setImageFile]           = useState<File | null>(null);
  const [imagePreview, setPreview]          = useState<string | null>(null);
  const [uploading, setUploading]           = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fecha y hora automáticas (read-only)
  const now        = new Date();
  const fechaAuto  = now.toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
  const horaAuto   = now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

  const { crearReporte, loading, error, success } = useCreateReporte();

  useEffect(() => { getTiposBloqueo().then(setTiposBloqueo); }, []);
  useEffect(() => { if (success) { onSuccess?.(); onClose(); } }, [success]);

  // Auto-rellenar dirección con reverse geocoding cuando se marca el punto A
  useEffect(() => {
    if (coordsA && !initialDireccion) {
      reverseGeocode(coordsA[0], coordsA[1]).then(calle => {
        if (calle) setDireccion(calle);
      });
    }
  }, [coordsA]);

  useEffect(() => {
    if (initialDireccion) setDireccion(initialDireccion);
  }, [initialDireccion]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const ext = file.name.split('.').pop();
      const fileName = `report_${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from('reportes-imagenes')
        .upload(fileName, file, { contentType: file.type, upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('reportes-imagenes')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (e) {
      console.error('Error subiendo imagen:', e);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!tipoSeleccionado || !descripcion.trim()) return;
    if (!coordsA) return; // Necesita al menos punto A

    // Leer id_usuario del localStorage
    const usuarioStr = localStorage.getItem('usuario');
    const id_usuario = usuarioStr ? JSON.parse(usuarioStr)?.id : undefined;

    let imagen_url: string | undefined;
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (url) imagen_url = url;
    }

    const tipoActual = tiposBloqueo.find(t => t.id_tipo_bloqueo === tipoSeleccionado);
    const tituloDesc = direccion
      ? `Bloqueo en ${direccion}: ${descripcion}`
      : descripcion;

    await crearReporte({
      id_usuario,
      id_tipo_bloqueo: tipoSeleccionado,
      descripcion: tituloDesc,
      latitud:  coordsA[1],
      longitud: coordsA[0],
      latitud_fin:  coordsB ? coordsB[1] : undefined,
      longitud_fin: coordsB ? coordsB[0] : undefined,
      direccion: direccion || undefined,
      imagen_url,
    } as any);
  };

  const tipoActual = tiposBloqueo.find(t => t.id_tipo_bloqueo === tipoSeleccionado);
  const puedeEnviar = !!tipoSeleccionado && !!descripcion.trim() && !!coordsA;

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>

      {/* ── Estado de puntos en el mapa ─────────────────────────── */}
      <div style={S.mapStatus}>
        <div style={{ ...S.dot, background: coordsA ? '#22c55e' : 'rgba(255,255,255,0.3)' }}>A</div>
        <div style={S.line} />
        <div style={{ ...S.dot, background: coordsB ? '#e74c3c' : 'rgba(255,255,255,0.3)' }}>B</div>
        <span style={{ ...S.mapHint, display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!coordsA ? 'Click en el mapa → Punto A (inicio)' :
           !coordsB ? 'Click en el mapa → Punto B (fin)' :
           <><CheckCircle size={14} /> Tramo del bloqueo marcado</>}
        </span>
      </div>

      {/* ── Tipo de bloqueo ─────────────────────────────────────── */}
      <div>
        <p style={S.label}>Tipo de bloqueo</p>
        <div style={S.tiposGrid}>
          {tiposBloqueo.map(t => (
            <button
              key={t.id_tipo_bloqueo}
              style={{
                ...S.tipoBtn,
                ...(tipoSeleccionado === t.id_tipo_bloqueo ? S.tipoBtnActive : {}),
              }}
              onClick={() => setTipo(t.id_tipo_bloqueo)}
            >
              <img src={getTipoIcono(t.nombre)} style={{ width: '24px', height: '24px', objectFit: 'contain' }} alt="" />
              <span style={{
                ...S.tipoNombre,
                ...(tipoSeleccionado === t.id_tipo_bloqueo ? { color: '#FCA311' } : {}),
              }}>
                {t.nombre}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Imagen (preview responsive) ─────────────────────────── */}
      <div>
        <p style={S.label}>Imagen del incidente <span style={{ opacity: 0.6 }}>(opcional)</span></p>
        {imagePreview ? (
          <div style={S.previewWrapper}>
            <img src={imagePreview} alt="preview" style={S.previewImg} />
            <button
              style={S.removeImgBtn}
              onClick={() => { setImageFile(null); setPreview(null); }}
            >✕</button>
          </div>
        ) : (
          <div style={S.photoArea} onClick={() => fileRef.current?.click()}>
            <span style={{ fontSize: '26px' }}>📷</span>
            <span style={S.photoText}>Subir foto del incidente</span>
            <span style={S.photoSub}>Toca para seleccionar</span>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*"
          style={{ display: 'none' }} onChange={handleFileChange} />
      </div>

      {/* ── Descripción ─────────────────────────────────────────── */}
      <div>
        <p style={S.label}>Descripción</p>
        <textarea
          style={S.textarea}
          placeholder="Describe el incidente..."
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          rows={3}
        />
      </div>

      {/* ── Dirección (auto desde reverse geocoding) ─────────────── */}
      <div>
        <p style={S.label}>Ubicación / Calle</p>
        <input
          style={{ ...S.textarea, resize: 'none' as const, padding: '10px 14px' }}
          type="text"
          placeholder="Nombre de la calle o avenida (se llena automáticamente)"
          value={direccion}
          onChange={e => setDireccion(e.target.value)}
        />
        {direccion && tipoSeleccionado && (
          <p style={S.tituloPreview}>
            📌 Título: <strong>Bloqueo en {direccion}</strong>
          </p>
        )}
      </div>

      {/* ── Fecha y hora automáticas (read-only) ─────────────────── */}
      <div style={S.fechaRow}>
        <div style={S.fechaField}>
          <p style={S.label}>Fecha</p>
          <input style={S.inputReadonly} type="text" value={fechaAuto} readOnly />
        </div>
        <div style={S.fechaField}>
          <p style={S.label}>Hora</p>
          <input style={S.inputReadonly} type="text" value={horaAuto} readOnly />
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────── */}
      {error && <p style={S.errorMsg}>{error}</p>}

      {/* ── Botón Crear ──────────────────────────────────────────── */}
      <button
        style={{
          ...S.submitBtn,
          opacity: (!puedeEnviar || loading || uploading) ? 0.5 : 1,
          cursor: (!puedeEnviar || loading || uploading) ? 'not-allowed' : 'pointer',
        }}
        onClick={handleSubmit}
        disabled={!puedeEnviar || loading || uploading}
      >
        {uploading ? '⏳ Subiendo imagen...' : loading ? '⏳ Creando reporte...' : '🚨 Crear Reporte'}
      </button>

      {/* Espacio inferior */}
      <div style={{ height: '20px' }} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  label: {
    fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px',
  },
  mapStatus: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '12px 14px',
  },
  dot: {
    width: '28px', height: '28px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: 800, color: '#fff', flexShrink: 0,
    transition: 'background 0.2s',
  },
  line: {
    flex: '0 0 20px', height: '3px', background: 'rgba(255,255,255,0.3)',
    borderRadius: '2px',
  },
  mapHint: {
    fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: 600,
    marginLeft: '6px',
  },
  tiposGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
  },
  tipoBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
    padding: '12px 6px', background: 'rgba(255,255,255,0.15)',
    border: '2px solid transparent', borderRadius: '12px',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  tipoBtnActive: {
    background: '#fff', borderColor: '#fff',
  },
  tipoNombre: {
    fontSize: '11px', fontWeight: 700, color: '#fff', textAlign: 'center' as const,
  },
  previewWrapper: {
    position: 'relative' as const,
    width: '100%', borderRadius: '12px', overflow: 'hidden',
    background: 'rgba(0,0,0,0.2)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    maxHeight: '160px',
  },
  previewImg: {
    width: '100%', maxHeight: '160px',
    objectFit: 'contain', display: 'block',
  },
  removeImgBtn: {
    position: 'absolute' as const, top: '8px', right: '8px',
    background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff',
    borderRadius: '50%', width: '26px', height: '26px',
    cursor: 'pointer', fontSize: '13px', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  photoArea: {
    width: '100%', height: '90px', background: 'rgba(0,0,0,0.15)',
    borderRadius: '12px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center', gap: '4px',
    border: '2px dashed rgba(255,255,255,0.35)',
    transition: 'background 0.15s',
  },
  photoText: { fontSize: '13px', fontWeight: 700, color: '#fff' },
  photoSub:  { fontSize: '11px', color: 'rgba(255,255,255,0.6)' },
  textarea: {
    width: '100%', padding: '12px 14px',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '10px', color: '#fff',
    fontSize: '14px', fontFamily: 'inherit',
    resize: 'vertical' as const, outline: 'none',
    boxSizing: 'border-box' as const,
  },
  tituloPreview: {
    fontSize: '11px', color: 'rgba(255,255,255,0.75)',
    marginTop: '6px', fontStyle: 'italic',
  },
  fechaRow: { display: 'flex', gap: '12px' },
  fechaField: { flex: 1, display: 'flex', flexDirection: 'column' as const },
  inputReadonly: {
    padding: '10px 14px',
    background: 'rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px', color: 'rgba(255,255,255,0.85)',
    fontSize: '13px', fontWeight: 600, outline: 'none',
    width: '100%', boxSizing: 'border-box' as const,
    cursor: 'not-allowed',
  },
  errorMsg: {
    color: '#fca5a5', fontSize: '13px', fontWeight: 600,
    textAlign: 'center' as const, padding: '8px',
    background: 'rgba(239,68,68,0.15)', borderRadius: '8px',
  },
  submitBtn: {
    width: '100%', padding: '15px',
    background: '#1a1a2e', border: 'none',
    borderRadius: '14px', color: '#fff',
    fontSize: '15px', fontWeight: 800,
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
  },
};