import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getReportes } from '../../modules/admin/services/adminService';
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



export default function ReportesPage() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [loadingAction, setLoadingAction] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [modal, setModal] = useState<{
    isOpen: boolean;
    reporteId: number | null;
  }>({
    isOpen: false,
    reporteId: null
  });

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      const data = await getReportes();
      setReportes(data);
    } catch (error) {
      console.error("Error al cargar reportes:", error);
    }
  };

  const confirmarResolucion = (id: number) => {
    setModal({ isOpen: true, reporteId: id });
  };

  const ejecutarResolucion = async () => {
    if (modal.reporteId === null) return;

    const id = modal.reporteId;
    setModal({ isOpen: false, reporteId: null });
    setLoadingAction(id);

    try {
      const response = await fetch(`${API_URL}/admin/cambiar-estado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: 2 }) // 2 = resuelto
      });

      if (!response.ok) throw new Error('Error en el servidor');
      await cargarReportes();
    } catch (error) {
      console.error("Error al resolver reporte:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const [busqueda, setBusqueda] = useState('');

  return (
    <div className="flex h-[100dvh] bg-gray-100 font-sans antialiased text-slate-900 overflow-hidden">

      {/* SIDEBAR (Desktop) */}
      <div className="hidden md:flex w-72 bg-gray-200 p-7 flex-col shadow-inner z-10 border-r border-gray-300">
        <h2 className="text-4xl font-black tracking-tighter text-slate-800 mb-1 italic">PAZLY</h2>
        <p className="text-[10px] font-bold text-gray-500 mb-10 uppercase tracking-[0.2em]">Soporte y Vigilancia</p>

        <p className="text-gray-400 text-[11px] font-extrabold mb-4 tracking-widest mt-4 text-center">Navegación</p>

        <div
          onClick={() => navigate('/admin')}
          className="flex items-center px-5 py-3 text-slate-600 hover:bg-gray-300 hover:text-slate-900 font-bold rounded-2xl cursor-pointer transition-all mb-3"
        >
          <LayoutDashboard className="w-5 h-5 mr-3 opacity-70" />
          Dashboard
        </div>

        <div
          onClick={() => navigate('/usuarios')}
          className="flex items-center px-5 py-3 text-slate-600 hover:bg-gray-300 hover:text-slate-900 font-bold rounded-2xl cursor-pointer transition-all mb-3"
        >
          <Users className="w-5 h-5 mr-3 opacity-70" />
          Usuarios
        </div>

        <p className="text-gray-400 text-[11px] font-extrabold mt-8 mb-4 tracking-widest text-center">Administración</p>

        <div
          onClick={() => navigate('/reportes')}
          className="flex items-center bg-blue-400 text-white px-5 py-3 rounded-2xl mb-1 cursor-pointer font-bold shadow-md shadow-blue-200 hover:bg-blue-500 transition-all active:scale-95"
        >
          <FileText className="w-5 h-5 mr-3" />
          Reportes
        </div>
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

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-y-auto pb-20 md:pb-0">

        {/* HEADER NARANJA */}
        <div className="bg-orange-500 text-white px-6 py-10 md:px-10 md:py-16 shadow-xl relative overflow-hidden flex-shrink-0">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm mb-2">Gestión de Reportes</h1>
            <p className="text-orange-100 font-medium opacity-90 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 opacity-80" />
              Incidencias y solicitudes de usuarios en tiempo real
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </div>

        {/* CARDS OSCURAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 p-4 md:p-10">
          {[
            { t: "Total Reportes", v: reportes.length, icon: <FileText className="w-8 h-8 opacity-20" /> },
            { t: "Pendientes", v: reportes.filter(r => r.id_estado === 1).length, icon: <Clock className="w-8 h-8 opacity-20 text-yellow-400" /> },
            { t: "Resueltos", v: reportes.filter(r => r.id_estado === 2).length, icon: <CheckCircle className="w-8 h-8 opacity-20 text-green-400" /> },
            { t: "Críticos (SOS)", v: reportes.filter(r => r.descripcion.toLowerCase().includes('urgente')).length, icon: <AlertCircle className="w-8 h-8 opacity-20 text-red-400" /> }
          ].map((c, i) => (
            <div key={i} className="bg-slate-800 text-white p-7 rounded-[2rem] shadow-lg border border-slate-700/50 hover:bg-slate-700 transition-colors group relative overflow-hidden">
              <div className="absolute top-4 right-4 group-hover:rotate-12 transition-transform">
                {c.icon}
              </div>
              <p className="text-[10px] font-bold opacity-60 tracking-[0.15em] uppercase mb-3 group-hover:text-blue-300 transition-colors">{c.t}</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">{c.v}</h2>
            </div>
          ))}
        </div>

        {/* TABLA DE REPORTES */}
        <div className="px-4 md:px-10 pb-4 md:pb-10 flex-1 flex flex-col">
          <div className="bg-white rounded-[2.5rem] shadow-xl p-6 md:p-8 border border-gray-200 flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 px-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Historial de Incidencias</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar reporte..."
                  className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Usuario</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Descripción de la Alerta</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Estado</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reportes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center opacity-20">
                          <FileText className="w-16 h-16 mb-2" />
                          <p className="font-black text-xl">Sin reportes pendientes</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    reportes
                      .filter((r) =>
                        r.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
                        r.usuarios?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                        r.usuarios?.apellido_paterno?.toLowerCase().includes(busqueda.toLowerCase())
                      )
                      .map((r) => (
                        <tr key={r.id_reporte} className="hover:bg-orange-50/30 transition-colors duration-200 group">
                          <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-slate-400">
                            #{r.id_reporte.toString().padStart(4, '0')}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold shadow-sm">
                                <User className="w-5 h-5" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-black text-slate-800 tracking-tight">
                                  {r.usuarios?.nombre} {r.usuarios?.apellido_paterno}
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">Solicitante</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 max-w-sm">
                            <p className="text-sm text-slate-600 font-medium italic leading-relaxed line-clamp-2">
                              "{r.descripcion}"
                            </p>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-4 py-1.5 inline-flex items-center text-[10px] font-black rounded-lg uppercase tracking-wider ${r.id_estado === 2
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                              }`}>
                              {r.id_estado === 2 ? <CheckCircle className="w-3 h-3 mr-2" /> : <Clock className="w-3 h-3 mr-2" />}
                              {r.estados_reporte?.nombre_estado}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            {r.id_estado !== 2 ? (
                              <button
                                disabled={loadingAction === r.id_reporte}
                                onClick={() => confirmarResolucion(r.id_reporte)}
                                className="bg-slate-800 text-white px-5 py-2 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-orange-500 transition-all shadow-md active:scale-95 flex items-center ml-auto gap-2"
                              >
                                {loadingAction === r.id_reporte ? (
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                  <>
                                    <ShieldCheck className="w-4 h-4" />
                                    Resolver
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-green-500 flex items-center justify-end font-bold text-[10px] uppercase tracking-tighter">
                                Completado <CheckCircle className="w-4 h-4 ml-1" />
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        <button onClick={() => navigate('/admin')} className="flex flex-col items-center p-2 text-slate-400 hover:text-slate-600">
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-bold mt-1">Inicio</span>
        </button>
        <button onClick={() => navigate('/usuarios')} className="flex flex-col items-center p-2 text-slate-400 hover:text-slate-600">
          <Users size={24} />
          <span className="text-[10px] font-bold mt-1">Usuarios</span>
        </button>
        <button onClick={() => navigate('/reportes')} className="flex flex-col items-center p-2 text-blue-500">
          <FileText size={24} />
          <span className="text-[10px] font-bold mt-1">Reportes</span>
        </button>
        <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="flex flex-col items-center p-2 text-red-400 hover:text-red-600">
          <XCircle size={24} />
          <span className="text-[10px] font-bold mt-1">Salir</span>
        </button>
      </div>

      {/* MODAL DE CONFIRMACIÓN - Estilo Dashboard */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setModal({ isOpen: false, reporteId: null })}
          />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-10 transform transition-all animate-in zoom-in-95 duration-200 text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-2 tracking-tighter">¿Resolver Incidencia?</h3>
            <p className="text-slate-500 text-sm mb-10 font-medium">
              Confirmas que esta situación ha sido atendida y solucionada.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={ejecutarResolucion}
                className="w-full py-4 rounded-2xl font-black text-white bg-green-500 hover:bg-green-600 text-sm uppercase tracking-widest transition-all shadow-lg shadow-green-200 active:scale-95"
              >
                Confirmar Solución
              </button>
              <button
                onClick={() => setModal({ isOpen: false, reporteId: null })}
                className="w-full py-4 rounded-2xl font-black text-slate-400 bg-gray-100 hover:bg-gray-200 text-sm uppercase tracking-widest transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}