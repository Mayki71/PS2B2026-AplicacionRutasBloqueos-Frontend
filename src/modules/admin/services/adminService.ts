const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const getAdmin = async () => {
  const res = await fetch(`${API_URL}/admin`);
  return res.json();
};

export const getUsuarios = async () => {
  const res = await fetch(`${API_URL}/admin/usuarios`);
  return res.json();
};

export const getReportes = async () => {
  const res = await fetch(`${API_URL}/admin/reportes`);
  return res.json();
};

export const getIncidentes = async () => {
  const res = await fetch(`${API_URL}/admin/incidentes`);
  return res.json();
};

export const getCategorias = async () => {
  const res = await fetch(`${API_URL}/admin/categorias`);
  return res.json();
};

export const getTiposIncidentes = async () => {
  const res = await fetch(`${API_URL}/admin/tipos_incidentes`);
  return res.json();
};
