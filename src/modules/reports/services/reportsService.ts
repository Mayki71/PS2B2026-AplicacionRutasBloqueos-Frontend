import axios from 'axios';
import type {
  Reporte,
  ReporteResumen,
  Comentario,
  CreateReportePayload,
} from '../reports.types';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const http = axios.create({ baseURL: API });

// Interceptor para añadir el Token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores 401 (No autorizado) o 403 (Prohibido/Baneado)
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Si el servidor dice que no estamos autorizados o estamos baneados, limpiamos y sacamos al usuario
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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

/** Mis reportes — filtra por el usuario logueado */
export const getMisReportes = async (): Promise<ReporteResumen[]> => {
  const usuarioStr = localStorage.getItem('usuario');
  const id_usuario = usuarioStr ? JSON.parse(usuarioStr)?.id : undefined;
  const params = id_usuario ? `?id_usuario=${id_usuario}` : '';
  const { data } = await http.get(`/reports/mis-reportes${params}`);
  return data;
};

/** Eliminar reporte propio */
export const deleteReporte = async (id_reporte: number): Promise<{ mensaje: string }> => {
  const usuarioStr = localStorage.getItem('usuario');
  const id_usuario = usuarioStr ? JSON.parse(usuarioStr)?.id : undefined;
  if (!id_usuario) throw new Error('No hay usuario logueado');
  const { data } = await http.delete(`/reports/${id_reporte}?id_usuario=${id_usuario}`);
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
  const usuarioStr = localStorage.getItem('usuario');
  let id_usuario = undefined;
  if (usuarioStr) {
    try { id_usuario = JSON.parse(usuarioStr).id; } catch {}
  }
  const { data } = await http.post(`/reports/${id_reporte}/comentarios`, {
    comentario,
    id_usuario,
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