import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsuarios, getReportes, eliminarReporte } from '../../modules/admin/services/adminService';
import MapView from '../../modules/map/components/MapView';
import MapBlockages from '../../modules/map/components/MapBlockages';
import { useUI } from '../../components/UIProvider';
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
  XCircle,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [reportes, setReportes] = useState<any[]>([]);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [modal, setModal] = useState<{ isOpen: boolean; reporteId: number | null }>({
    isOpen: false,
    reporteId: null
  });
  const [loadingAction, setLoadingAction] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useUI();

  useEffect(() => {
    const fetchData = () => {
      getUsuarios().then(data => {
        if (!data) return;
        setUsuarios(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
      });
      getReportes().then(data => {
        if (!data) return;
        setReportes(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
      });
    };

    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleMapReady = (map: mapboxgl.Map) => {
    setMapInstance(map);
  };

  const confirmarEliminacion = (id: number) => {
    setModal({ isOpen: true, reporteId: id });
  };

  const ejecutarEliminacion = async () => {
    if (!modal.reporteId) return;
    
    setLoadingAction(true);
    try {
      await eliminarReporte(modal.reporteId);
      showToast('Reporte eliminado', 'success');
      getReportes().then(setReportes);
    } catch (error) {
      showToast('Error al eliminar reporte', 'error');
    } finally {
      setLoadingAction(false);
      setModal({ isOpen: false, reporteId: null });
    }
  };

  return (
    <div className="flex h-[100dvh] bg-gray-100 font-sans antialiased text-slate-900 overflow-hidden">
      {/* SIDEBAR (Desktop) */}
      <div className="hidden md:flex w-72 bg-gray-200 p-7 flex-col shadow-inner z-10 border-r border-gray-300">
        <h2 className="text-4xl font-black tracking-tighter text-slate-800 mb-1 italic">PAZLY</h2>
        <p className="text-[10px] font-bold text-gray-500 mb-10 uppercase tracking-[0.2em]">Soporte y Vigilancia</p>

        <p className="text-gray-400 text-[11px] font-extrabold mb-4 tracking-widest mt-4">Navegación</p>

        {/* BOTÓN DASHBOARD: ACTIVO (NARANJA) */}
        <div
          onClick={() => navigate('/admin')}
          className="flex items-center bg-[#FCA311] text-white px-5 py-3 rounded-2xl mb-3 cursor-pointer font-bold shadow-md hover:bg-[#e5940f] transition-all active:scale-95"
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
              localStorage.removeItem('token');
              localStorage.removeItem('usuario');
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
      <div className="flex-1 flex flex-col overflow-y-auto pb-20 md:pb-0">
        {/* HEADER */}
        <div className="bg-[#FCA311] text-white px-6 py-6 md:px-10 md:py-8 shadow-xl relative overflow-hidden flex-shrink-0">
          <div className="relative z-10 flex items-center justify-center">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm text-center">Dashboard General</h1>
          </div>
          {/* Decoración sutil */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 px-4 py-4 md:px-10">
          {[
            { t: "Incidentes activos", v: reportes.filter(r => r.id_estado === 1).length },
            { t: "Reportes totales", v: reportes.length },
            { t: "Usuarios activos", v: usuarios.filter(u => u.es_activo).length },
            { t: "Tiempo resolución", v: "45min" }
          ].map((c, i) => (
            <div key={i} className="bg-slate-800 text-white p-4 md:p-5 rounded-2xl shadow-md border border-slate-700/50 hover:bg-slate-700 transition-colors group">
              <p className="text-[9px] font-bold opacity-60 tracking-[0.1em] uppercase mb-1 group-hover:text-blue-300 transition-colors">{c.t}</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter">{c.v}</h2>
            </div>
          ))}
        </div>

        {/* MAPA + REPORTES */}
        <div className="flex-1 flex flex-col xl:flex-row gap-6 md:gap-8 px-4 md:px-10 pb-10 items-stretch min-h-0">
          {/* MAPA - Ajustado para no estirarse */}
          <div className="flex-1 w-full bg-white rounded-[2rem] shadow-xl p-5 border border-gray-200 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Mapa en vivo</h3>
              <button onClick={() => navigate('/reportes')} className="text-[10px] font-bold bg-[#FCA311] text-white px-3 py-1 rounded-full uppercase tracking-wider hover:bg-[#e5940f] transition-colors">
                Expandir Vista
              </button>
            </div>
            <div className="flex-1 w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 relative">
              <MapView onMapReady={handleMapReady} mapStyle="standard" />
              {mapInstance && (
                <MapBlockages
                  map={mapInstance}
                  reportes={reportes}
                  tiposFiltro={[]}
                  onSelectReporte={(id) => confirmarEliminacion(id)}
                />
              )}
            </div>
          </div>

          {/* COMENTARIOS RECIENTES */}
          <div className="w-full xl:w-[400px] bg-[#FCA311] p-7 rounded-[2.5rem] shadow-2xl flex flex-col h-[500px] xl:h-auto">
            <h3 className="text-2xl text-white font-black mb-6 tracking-tight px-2">Comentarios Recientes</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {reportes
                .flatMap(r => (r.comentarios || []).map((c: any) => ({ ...c, id_reporte: r.id_reporte })))
                .sort((a, b) => new Date(b.fecha_comentario).getTime() - new Date(a.fecha_comentario).getTime())
                .slice(0, 10)
                .map((c: any) => (
                <div
                  key={c.id_comentario}
                  onClick={() => navigate(`/reportes?reporteId=${c.id_reporte}&comentarioId=${c.id_comentario}`)}
                  className="bg-white/95 backdrop-blur-sm p-4 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-orange-200 cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-black text-slate-800 text-sm leading-none tracking-tight">
                      {c.usuarios?.nombre} {c.usuarios?.apellido_paterno}
                    </p>
                    <span className="text-[9px] font-bold text-slate-400">
                      {new Date(c.fecha_comentario).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                    "{c.comentario}"
                  </p>
                </div>
              ))}
              {reportes.flatMap(r => r.comentarios || []).length === 0 && (
                <p className="text-white/70 text-center font-medium text-sm mt-10">No hay comentarios recientes.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        <button onClick={() => navigate('/admin')} className="flex flex-col items-center p-2 text-blue-500">
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-bold mt-1">Inicio</span>
        </button>
        <button onClick={() => navigate('/usuarios')} className="flex flex-col items-center p-2 text-slate-400 hover:text-slate-600">
          <Users size={24} />
          <span className="text-[10px] font-bold mt-1">Usuarios</span>
        </button>
        <button onClick={() => navigate('/reportes')} className="flex flex-col items-center p-2 text-slate-400 hover:text-slate-600">
          <FileText size={24} />
          <span className="text-[10px] font-bold mt-1">Reportes</span>
        </button>
        <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="flex flex-col items-center p-2 text-red-400 hover:text-red-600">
          <XCircle size={24} />
          <span className="text-[10px] font-bold mt-1">Salir</span>
        </button>
      </div>

    {/* MODAL DE CONFIRMACIÓN */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setModal({ isOpen: false, reporteId: null })}
          />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 transform transition-all animate-in zoom-in-95 duration-200 text-center">

            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner bg-red-100 text-red-500">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">¿Eliminar Reporte?</h3>
            <p className="text-slate-500 text-sm mb-8 font-medium">
              Estás a punto de eliminar este reporte permanentemente del mapa.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={ejecutarEliminacion}
                disabled={loadingAction}
                className="w-full py-3.5 rounded-2xl font-black text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-200 text-sm uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {loadingAction ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sí, Eliminar'}
              </button>
              <button
                onClick={() => setModal({ isOpen: false, reporteId: null })}
                disabled={loadingAction}
                className="w-full py-3.5 rounded-2xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200 text-sm uppercase tracking-widest transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}