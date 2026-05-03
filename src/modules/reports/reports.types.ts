// ─── Catálogos ───────────────────────────────────────────────
export interface TipoBloqueo {
  id_tipo_bloqueo: number;
  nombre: string;
  descripcion?: string;
  icono?: string;
  color_hex?: string;
  requiere_imagen: boolean;
}

export interface EstadoReporte {
  id_estado: number;
  nombre_estado: string;
}

export interface TipoVoto {
  id_tipo_voto: number;
  nombre_voto: string; // 'activo' | 'inactivo'
}

// ─── Entidades principales ────────────────────────────────────
export interface Ubicacion {
  id_ubicacion: number;
  latitud: number;
  longitud: number;
  latitud_fin?: number;
  longitud_fin?: number;
  direccion?: string;
  referencia?: string;
}

export interface Comentario {
  id_comentario: number;
  id_reporte: number;
  comentario: string;
  fecha_comentario: string;
  es_editado: boolean;
  usuarios?: {
    nombre: string;
    apellido_paterno: string;
  };
}

export interface VotosReporte {
  activo: number;
  inactivo: number;
  total: number;
}

// Reporte completo con joins (lo que devuelve el backend)
export interface Reporte {
  id_reporte: number;
  id_usuario: number;
  descripcion: string;
  hora_inicio: string;
  fecha_creacion: string;
  fecha_resolucion?: string;
  tiene_imagenes: boolean;
  imagen_principal_url?: string;
  ubicaciones: Ubicacion;
  tipos_bloqueo: TipoBloqueo;
  estados_reporte: EstadoReporte;
  votos: VotosReporte;
}

// Reporte simplificado para la lista "Tus Reportes"
export interface ReporteResumen {
  id_reporte: number;
  descripcion: string;
  hora_inicio: string;
  fecha_creacion: string;
  ubicaciones: Pick<Ubicacion, 'direccion' | 'referencia'>;
  tipos_bloqueo: Pick<TipoBloqueo, 'nombre'>;
}

// ─── DTOs de creación ─────────────────────────────────────────
export interface CreateReportePayload {
  id_usuario?: number;
  id_tipo_bloqueo: number;
  descripcion: string;
  latitud: number;
  longitud: number;
  latitud_fin?: number;
  longitud_fin?: number;
  direccion?: string;
  referencia?: string;
  comentario_inicial?: string;
  imagen_url?: string;
}

// ─── Helpers ──────────────────────────────────────────────────
// Construye el título visible en UI: "Bloqueo – Av. Argentina"
export const buildTituloReporte = (reporte: Reporte | ReporteResumen): string => {
  const tipo = reporte.tipos_bloqueo.nombre;
  const dir = reporte.ubicaciones.direccion ?? reporte.ubicaciones.referencia ?? '';
  return dir ? `${tipo} – ${dir}` : tipo;
};

// Tiempo relativo: "Hace 15 min", "Hace 2 h"
export const tiempoRelativo = (fechaStr: string): string => {
  const diff = Date.now() - new Date(fechaStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Justo ahora';
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h} h`;
  return `Hace ${Math.floor(h / 24)} días`;
};