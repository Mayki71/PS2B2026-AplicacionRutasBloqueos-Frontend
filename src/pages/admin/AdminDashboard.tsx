import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsuarios, getReportes } from '../../modules/admin/services/adminService';
import Map from 'react-map-gl';
import { NavigationControl, Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  User, 
  Clock,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Search,
  XCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [reportes, setReportes] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getUsuarios().then(setUsuarios);
    getReportes().then(setReportes);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 font-sans antialiased text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-72 bg-gray-200 p-7 flex flex-col shadow-inner z-10 border-r border-gray-300">
        <h2 className="text-4xl font-black tracking-tighter text-slate-800 mb-1 italic">PAZLY</h2>
        <p className="text-[10px] font-bold text-gray-500 mb-10 uppercase tracking-[0.2em]">Soporte y Vigilancia</p>

        <p className="text-gray-400 text-[11px] font-extrabold mb-4 tracking-widest mt-4">Navegación</p>

  {/* BOTÓN DASHBOARD: ACTIVO (AZUL) */}
  <div
    onClick={() => navigate('/admin')}
    className="flex items-center bg-blue-400 text-white px-5 py-3 rounded-2xl mb-3 cursor-pointer font-bold shadow-md shadow-blue-200 hover:bg-blue-500 transition-all active:scale-95"
  >
    <LayoutDashboard className="w-5 h-5 mr-3" />
    Dashboard
  </div>

  {/* BOTÓN USUARIOS: INACTIVO (GRIS) */}
  <div
    onClick={() => navigate('/usuarios')}
    className="flex items-center px-5 py-3 text-slate-600 hover:bg-gray-300 hover:text-slate-900 font-bold rounded-2xl cursor-pointer transition-all mb-3"
  >
    <Users className="w-5 h-5 mr-3 opacity-70" />
    Usuarios
  </div>

  <p className="text-gray-400 text-[11px] font-extrabold mt-8 mb-4 tracking-widest">Administración</p>

  {/* BOTÓN REPORTES: INACTIVO (GRIS) */}
  <div
    onClick={() => navigate('/reportes')}
    className="flex items-center px-5 py-3 text-slate-600 hover:bg-gray-300 hover:text-slate-900 font-bold rounded-2xl cursor-pointer transition-all"
  >
    <FileText className="w-5 h-5 mr-3 opacity-70" />
    Reportes
  </div>
  {/* ... (todo tu código anterior de navegación) ... */}

{/* ESPACIADOR: Empuja el botón hacia abajo */}
<div className="flex-1"></div> 

{/* BOTÓN CERRAR SESIÓN */}
<div className="mt-auto pt-10">
  <button
    onClick={() => {
      // Aquí tu lógica: localStorage.clear(), etc.
      navigate('/login');
    }}
    className="w-full flex items-center px-5 py-3 text-red-500 hover:bg-red-50 font-bold rounded-2xl cursor-pointer transition-all active:scale-95 group"
  >
    <div className="bg-red-100 p-2 rounded-lg mr-3 group-hover:bg-red-500 group-hover:text-white transition-colors">
      <XCircle className="w-5 h-5" />
    </div>
    Cerrar Sesión
  </button>
</div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* HEADER */}
        <div className="bg-orange-500 text-white px-10 py-16 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tight drop-shadow-sm">Dashboard General</h1>
            
          </div>
          {/* Decoración sutil */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-10">
          {[
            { t: "Incidentes activos", v: reportes.filter(r => r.id_estado === 1).length },
            { t: "Reportes totales", v: reportes.length },
            { t: "Usuarios activos", v: usuarios.filter(u => u.es_activo).length },
            { t: "Tiempo resolución", v: "45min" }
          ].map((c, i) => (
            <div key={i} className="bg-slate-800 text-white p-7 rounded-[2rem] shadow-lg border border-slate-700/50 hover:bg-slate-700 transition-colors group">
              <p className="text-[10px] font-bold opacity-60 tracking-[0.15em] uppercase mb-3 group-hover:text-blue-300 transition-colors">{c.t}</p>
              <h2 className="text-5xl font-black tracking-tighter">{c.v}</h2>
            </div>
          ))}
        </div>

        {/* MAPA + REPORTES */}
        <div className="flex flex-col xl:flex-row gap-8 px-10 pb-10 items-start">
          {/* MAPA - Ajustado para no estirarse */}
          <div className="flex-1 w-full bg-orange-500 p-7 rounded-[2.5rem] shadow-2xl flex flex-col">
            <div className="flex justify-between items-center text-white mb-5 px-2">
              <h3 className="text-2xl font-black tracking-tight">Mapa en vivo</h3>
              <button className="text-[10px] font-black bg-slate-900/20 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full hover:bg-white hover:text-orange-600 transition-all uppercase tracking-tighter">
                Expandir Vista
              </button>
            </div>
            
            {/* Contenedor con altura fija para Mapbox */}
            <div className="h-[400px] w-full rounded-[1.5rem] overflow-hidden shadow-2xl bg-slate-100 relative border-4 border-orange-400/30">
              <Map
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                initialViewState={{
                  longitude: -68.1193,
                  latitude: -16.4897,
                  zoom: 12
                }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                style={{ width: '100%', height: '100%' }}
              >
                <NavigationControl position="top-right" />
                <Marker longitude={-68.1193} latitude={-16.4897}>
                  <div className="text-4xl animate-bounce drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">🚨</div>
                </Marker>
              </Map>
            </div>
          </div>

          {/* REPORTES */}
          <div className="w-full xl:w-[400px] bg-orange-500 p-7 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[510px]">
            <h3 className="text-2xl text-white font-black mb-6 tracking-tight px-2">Recientes</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {reportes.slice(0, 5).map((r) => (
                <div
                  key={r.id_reporte}
                  className="bg-white/95 backdrop-blur-sm p-5 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-orange-200 group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-black text-slate-800 text-lg leading-none tracking-tight">
                      {r.usuarios?.nombre}
                    </p>
                    <span className="text-[9px] font-black bg-orange-100 text-orange-600 px-2 py-1 rounded-lg uppercase italic">
                      {r.estados_reporte?.nombre_estado}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-2 italic">
                    "{r.descripcion}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}