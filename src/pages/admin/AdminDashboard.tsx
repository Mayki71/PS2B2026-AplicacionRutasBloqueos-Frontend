import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsuarios, getReportes } from '../../modules/admin/services/adminService';

export default function AdminDashboard() {

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [reportes, setReportes] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getUsuarios().then(setUsuarios);
    getReportes().then(setReportes);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-gray-200 p-5">
        <h2 className="text-xl font-bold">PAZLY</h2>
        <p className="text-sm text-gray-600 mb-6">Panel de administración</p>

        <p className="text-gray-500 text-xs mb-2">PRINCIPAL</p>

        <div
          onClick={() => navigate('/')}
          className="bg-blue-400 text-white p-2 rounded mb-2 cursor-pointer"
        >
          Dashboard
        </div>

        <div
          onClick={() => navigate('/usuarios')}
          className="p-2 hover:bg-gray-300 rounded cursor-pointer"
        >
          Usuarios
        </div>

        <p className="text-gray-500 text-xs mt-5 mb-2">GESTIÓN</p>

        <div
          onClick={() => navigate('/reportes')}
          className="p-2 hover:bg-gray-300 rounded cursor-pointer"
        >
          Reportes
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1">

        {/* HEADER */}
        <div className="bg-orange-500 text-white p-5 text-2xl font-bold shadow">
          Dashboard General
        </div>

        {/* CARDS */}
        <div className="flex gap-5 p-5 flex-wrap">
          {[
            {
              t: "Incidentes activos",
              v: reportes.filter(r => r.id_estado === 1).length
            },
            {
              t: "Reportes totales",
              v: reportes.length
            },
            {
              t: "Usuarios activos",
              v: usuarios.filter(u => u.es_activo).length
            },
            {
              t: "Tiempo prom. resolución",
              v: "45min"
            }
          ].map((c, i) => (
            <div key={i} className="bg-slate-800 text-white p-5 rounded-xl w-56 shadow">
              <p className="text-sm opacity-80">{c.t}</p>
              <h2 className="text-3xl font-bold">{c.v}</h2>
            </div>
          ))}
        </div>

        {/* MAPA + REPORTES */}
        <div className="flex gap-5 px-5">

          {/* MAPA */}
          <div className="flex-1 bg-orange-500 p-4 rounded-xl shadow">
            <div className="flex justify-between text-white mb-2">
              <h3 className="font-bold">Mapa en tiempo real</h3>
              <span className="text-sm cursor-pointer">Ver completo</span>
            </div>

            <div className="bg-gray-300 h-72 rounded-lg flex items-center justify-center">
              MAPA (próximamente real 😏)
            </div>
          </div>

          {/* REPORTES */}
          <div className="w-80 bg-orange-500 p-4 rounded-xl shadow">
            <h3 className="text-white font-bold mb-3">Reportes recientes</h3>

            {reportes.slice(0, 5).map((r) => (
              <div
                key={r.id_reporte}
                className="bg-white p-3 rounded-lg mb-2 shadow hover:scale-105 transition"
              >
                <p className="font-semibold">
                  {r.usuarios?.nombre} {r.usuarios?.apellido_paterno}
                </p>

                <p className="text-sm text-gray-600">
                  {r.descripcion}
                </p>

                <p className="text-xs text-gray-400">
                  {r.estados_reporte?.nombre_estado}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}