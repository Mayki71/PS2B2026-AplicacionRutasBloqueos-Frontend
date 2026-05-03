import { useState, useEffect, useCallback } from 'react';
import type { Reporte, ReporteResumen, Comentario, CreateReportePayload } from '../reports.types';
import * as svc from '../services/reportsService';

// ─── Hook: lista de reportes activos ─────────────────────────
export const useReportes = () => {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchReportes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await svc.getReportes();
      setReportes(data);
    } catch {
      setError('No se pudieron cargar los reportes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReportes(); }, [fetchReportes]);

  return { reportes, loading, error, refetch: fetchReportes };
};

// ─── Hook: detalle de un reporte ─────────────────────────────
export const useReporteDetalle = (id: number) => {
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchReporte = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await svc.getReporteById(id);
      setReporte(data);
    } catch {
      setError('Reporte no encontrado.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchReporte(); }, [fetchReporte]);

  return { reporte, setReporte, loading, error, refetch: fetchReporte };
};

// ─── Hook: mis reportes ───────────────────────────────────────
export const useMisReportes = () => {
  const [misReportes, setMisReportes] = useState<ReporteResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    svc.getMisReportes()
      .then(setMisReportes)
      .catch(() => setError('No se pudieron cargar tus reportes.'))
      .finally(() => setLoading(false));
  }, []);

  return { misReportes, loading, error };
};

// ─── Hook: crear reporte ──────────────────────────────────────
export const useCreateReporte = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const crearReporte = async (payload: CreateReportePayload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await svc.createReporte(payload);
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al crear el reporte.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return { crearReporte, loading, error, success };
};

// ─── Hook: votos ─────────────────────────────────────────────
export const useVotar = (reporte: Reporte | null, onSuccess: () => void) => {
  const [loadingVoto, setLoadingVoto] = useState(false);

  const votar = async (tipo: 1 | 2) => {
    if (!reporte) return;
    setLoadingVoto(true);
    try {
      await svc.votarReporte(reporte.id_reporte, tipo);
      onSuccess(); // recarga el reporte para actualizar conteo
    } catch {
      // silencioso, el usuario ya votó o hubo un error
    } finally {
      setLoadingVoto(false);
    }
  };

  return { votar, loadingVoto };
};

// ─── Hook: comentarios ────────────────────────────────────────
export const useComentarios = (id_reporte: number) => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading]         = useState(true);
  const [enviando, setEnviando]       = useState(false);

  const fetchComentarios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await svc.getComentarios(id_reporte);
      setComentarios(data);
    } finally {
      setLoading(false);
    }
  }, [id_reporte]);

  useEffect(() => { fetchComentarios(); }, [fetchComentarios]);

  const enviarComentario = async (texto: string) => {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      const nuevo = await svc.addComentario(id_reporte, texto.trim());
      
      // Adjuntar el usuario actual para que el UI lo muestre de inmediato
      if (!nuevo.usuarios) {
        const usuarioStr = localStorage.getItem('usuario');
        if (usuarioStr) {
          const u = JSON.parse(usuarioStr);
          nuevo.usuarios = { nombre: u.nombre, apellido_paterno: u.apellido_paterno };
        }
      }

      setComentarios((prev) => [...prev, nuevo]);
    } finally {
      setEnviando(false);
    }
  };

  return { comentarios, loading, enviando, enviarComentario };
};