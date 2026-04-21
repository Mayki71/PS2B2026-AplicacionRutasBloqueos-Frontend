export const getAdmin = async () => {
  const res = await fetch('http://localhost:3000/admin');
  return res.json();
};

export const getUsuarios = async () => {
  const res = await fetch('http://localhost:3000/admin/usuarios');
  return res.json();
};

export const getReportes = async () => {
  const res = await fetch('http://localhost:3000/admin/reportes');
  return res.json();
};