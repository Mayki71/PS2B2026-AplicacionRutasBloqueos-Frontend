const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const handleResponse = async (res: Response) => {
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
    return null;
  }
  if (!res.ok) throw new Error('Error en la petición');
  const text = await res.text();
  return text ? JSON.parse(text) : true;
};

export const getAdmin = async () => {
  const res = await fetch(`${API_URL}/admin`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getUsuarios = async () => {
  const res = await fetch(`${API_URL}/admin/usuarios`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getReportes = async () => {
  const res = await fetch(`${API_URL}/admin/reportes`, { 
    headers: getAuthHeaders(),
    cache: 'no-store' 
  });
  return handleResponse(res);
};

export const getIncidentes = async () => {
  const res = await fetch(`${API_URL}/admin/incidentes`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getCategorias = async () => {
  const res = await fetch(`${API_URL}/admin/categorias`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getTiposIncidentes = async () => {
  const res = await fetch(`${API_URL}/admin/tipos_incidentes`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const activarUsuario = async (id: number) => {
  const res = await fetch(`${API_URL}/admin/activar`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ id })
  });
  return handleResponse(res);
};

export const desactivarUsuario = async (id: number) => {
  const res = await fetch(`${API_URL}/admin/desactivar`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ id })
  });
  return handleResponse(res);
};

export const promoverAdmin = async (id: number) => {
  const res = await fetch(`${API_URL}/admin/promover`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ id })
  });
  return handleResponse(res);
};

export const quitarAdmin = async (id: number) => {
  const res = await fetch(`${API_URL}/admin/quitar-admin`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ id })
  });
  return handleResponse(res);
};

export const eliminarReporte = async (id: number) => {
  const res = await fetch(`${API_URL}/admin/eliminar-reporte`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ id })
  });
  return handleResponse(res);
};

export const eliminarComentario = async (id: number) => {
  const res = await fetch(`${API_URL}/admin/eliminar-comentario`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ id })
  });
  return handleResponse(res);
};

export const resolverReporte = async (id: number) => {
  const res = await fetch(`${API_URL}/admin/resolver`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ id })
  });
  return handleResponse(res);
};
