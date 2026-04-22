import axios from 'axios';
import type {
  Reporte,
  ReporteResumen,
  Comentario,
  CreateReportePayload,
} from '../reports.types';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const http = axios.create({ baseURL: API });

// ─── Reportes ─────────────────────────────────────────────────

/** Lista todos los reportes activos */
export const getReportes = async (): Promise<Reporte[]> => {
  const { data } = await http.get('/reports');
  return data;
};

/** Detalle de un reporte */
export const getReporteById = async (id: number): Promise<Reporte> => {
  const { data } = await http.get(`/reports/${id}`);
  return data;
};

/** Crear un nuevo reporte */
export const createReporte = async (
  payload: CreateReportePayload,
): Promise<Reporte> => {
  const { data } = await http.post('/reports', payload);
  return data;
};

/** Mis reportes — pantalla "Tus Reportes" */
export const getMisReportes = async (): Promise<ReporteResumen[]> => {
  const { data } = await http.get('/reports/mis-reportes');
  return data;
};

// ─── Votos ────────────────────────────────────────────────────

/** Votar: id_tipo_voto 1=activo, 2=inactivo */
export const votarReporte = async (
  id_reporte: number,
  id_tipo_voto: 1 | 2,
): Promise<{ mensaje: string }> => {
  const { data } = await http.post(`/reports/${id_reporte}/votar`, {
    id_tipo_voto,
  });
  return data;
};

// ─── Comentarios ──────────────────────────────────────────────

export const getComentarios = async (id_reporte: number): Promise<Comentario[]> => {
  const { data } = await http.get(`/reports/${id_reporte}/comentarios`);
  return data;
};

export const addComentario = async (
  id_reporte: number,
  comentario: string,
): Promise<Comentario> => {
  const { data } = await http.post(`/reports/${id_reporte}/comentarios`, {
    comentario,
  });
  return data;
};

// ─── Tipos de bloqueo (catálogo) ──────────────────────────────
export const getTiposBloqueo = async () => {
  // Supabase directamente o endpoint propio
  // Por ahora consultamos el backend — si no existe el endpoint, usar datos hardcodeados
  try {
    const { data } = await http.get('/reports/tipos-bloqueo');
    return data;
  } catch {
    // Fallback mientras no exista el endpoint
    return [
      { id_tipo_bloqueo: 1, nombre: 'Bloqueo social', requiere_imagen: false },
      { id_tipo_bloqueo: 2, nombre: 'Accidente',      requiere_imagen: true  },
      { id_tipo_bloqueo: 3, nombre: 'Construcción',   requiere_imagen: false },
      { id_tipo_bloqueo: 4, nombre: 'Feria',          requiere_imagen: false },
      { id_tipo_bloqueo: 5, nombre: 'Otro',           requiere_imagen: false },
    ];
  }
};