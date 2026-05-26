import React, { useState, useEffect, useCallback } from 'react';
import type { Reporte, ReporteResumen, Comentario, CreateReportePayload } from '../reports.types';
import * as svc from '../services/reportsService';

// ─── Hook: lista de reportes activos ─────────────────────────
export const useReportes = () => {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchReportes = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const data = await svc.getReportes();
      
      // Solo actualizar si la data cambió para evitar re-renders innecesarios
      setReportes(prev => {
        if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
        return data;
      });
    } catch {
      setError('No se pudieron cargar los reportes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchReportes(); 

    // Polling silencioso cada 5 segundos (más rápido para que parezca inmediato)
    const interval = setInterval(() => {
      fetchReportes(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchReportes]);

  return { reportes, loading, error, refetch: fetchReportes };
};

// ─── Hook: detalle de un reporte ─────────────────────────────
export const useReporteDetalle = (id: number) => {
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [wasDeleted, setWasDeleted] = useState(false);

  const fetchReporte = useCallback(async (isSilent = false) => {
    // loading=true solo en la carga inicial (primera vez), nunca en refetches
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const data = await svc.getReporteById(id);
      setReporte(prev => {
        if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
        return data;
      });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404 || status === 400) {
        // El reporte fue eliminado (ya sea silencioso o no)
        setWasDeleted(true);
      } else if (!isSilent) {
        setError('Reporte no encontrado.');
      }
      // Solo desactivar loading en carga inicial
      if (!isSilent) setLoading(false);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [id]);

  useEffect(() => { 
    fetchReporte(); 
    
    const interval = setInterval(() => {
      fetchReporte(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchReporte]);

  return { reporte, setReporte, loading, error, wasDeleted, refetch: fetchReporte };
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
export const useVotar = (
  reporte: Reporte | null,
  onSuccess: (isSilent?: boolean) => void,
  setReporte?: React.Dispatch<React.SetStateAction<Reporte | null>>
) => {
  const [loadingVoto, setLoadingVoto] = useState(false);

  const votar = async (tipo: 1 | 2) => {
    if (!reporte) return;
    setLoadingVoto(true);

    try {
      await svc.votarReporte(reporte.id_reporte, tipo);
      // Refetch silencioso para obtener los contadores reales y exactos del servidor
      onSuccess(true);
    } catch {
      // Si falló, podemos notificar (opcional), pero el estado se mantendrá igual
      onSuccess(true);
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

  const fetchComentarios = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await svc.getComentarios(id_reporte);
      setComentarios(prev => {
        if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
        return data;
      });
    } finally {
      setLoading(false);
    }
  }, [id_reporte]);

  useEffect(() => { 
    fetchComentarios(); 
    
    const interval = setInterval(() => {
      fetchComentarios(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchComentarios]);

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