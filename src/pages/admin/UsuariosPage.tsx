import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUsuarios } from '../../modules/admin/services/adminService';
import { useUI } from '../../components/UIProvider';
import {
  UserCircle,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  FileText,
  AlertCircle,
  User,
  Clock,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Search
} from 'lucide-react';




export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { showToast } = useUI();
  const location = useLocation();

  const [modal, setModal] = useState<{
    isOpen: boolean;
    userId: number | null;
    action: 'activar' | 'desactivar' | null;
  }>({
    isOpen: false,
    userId: null,
    action: null
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  const solicitarConfirmacion = (id: number, action: 'activar' | 'desactivar') => {
    setModal({ isOpen: true, userId: id, action });
  };

  const ejecutarAccion = async () => {
    if (!modal.userId || !modal.action) return;

    const { userId, action } = modal;

    setModal({ isOpen: false, userId: null, action: null });
    setLoading(true);
    setActionId(userId);

    try {
      const endpoint = `${API_URL}/admin/${action}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      });

      if (!response.ok) throw new Error('Error en el servidor');

      await cargarUsuarios();
    } catch (error) {
      console.error(`Error al ${action}:`, error);
      showToast('Hubo un problema al conectar con el servidor. Intenta nuevamente.', 'error');
    } finally {
      setLoading(false);
      setActionId(null);
    }
  };

  return (
    <div className="flex h-[100dvh] bg-gray-100 font-sans antialiased text-slate-900 overflow-hidden">

      {/* SIDEBAR (Desktop) */}
      <div className="hidden md:flex w-72 bg-gray-200 p-7 flex-col shadow-inner z-10 border-r border-gray-300">
        <h2 className="text-4xl font-black tracking-tighter text-slate-800 mb-1 italic">PAZLY</h2>
        <p className="text-[10px] font-bold text-gray-500 mb-10 uppercase tracking-[0.2em]">Soporte y Vigilancia</p>

        <p className="text-gray-400 text-[11px] font-extrabold mb-4 tracking-widest mt-4">Navegación</p>

        {/* Botón Dashboard (Gris) */}
        <div
          onClick={() => navigate('/admin')}
          className="flex items-center px-5 py-3 text-slate-600 hover:bg-gray-300 hover:text-slate-900 font-bold rounded-2xl cursor-pointer transition-all mb-3"
        >
          <LayoutDashboard className="w-5 h-5 mr-3 opacity-70" />
          Dashboard
        </div>

        {/* Botón Usuarios (ESTE ES EL QUE DEBE ESTAR AZUL EN ESTA PÁGINA) */}
        <div
          onClick={() => navigate('/usuarios')}
          className="flex items-center bg-blue-400 text-white px-5 py-3 rounded-2xl mb-3 cursor-pointer font-bold shadow-md shadow-blue-200 hover:bg-blue-500 transition-all active:scale-95"
        >
          <Users className="w-5 h-5 mr-3" />
          Usuarios
        </div>

        <p className="text-gray-400 text-[11px] font-extrabold mt-8 mb-4 tracking-widest">Administración</p>

        {/* Botón Reportes (Gris) */}
        <div
          onClick={() => navigate('/reportes')}
          className="flex items-center px-5 py-3 text-slate-600 hover:bg-gray-300 hover:text-slate-900 font-bold rounded-2xl cursor-pointer transition-all"
        >
          <FileText className="w-5 h-5 mr-3 opacity-70" />
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
      <div className="flex-1 flex flex-col overflow-y-auto relative pb-20 md:pb-0">

        {/* HEADER NARANJA */}
        <div className="bg-orange-500 text-white px-6 py-10 md:px-10 md:py-16 shadow-xl relative overflow-hidden flex-shrink-0">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm mb-2">Gestión de Usuarios</h1>
            <p className="text-orange-100 font-medium opacity-90 flex items-center">
              Panel de administración de accesos y roles
            </p>
          </div>
          {/* Decoración sutil */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </div>

        {/* CARDS OSCURAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 p-4 md:p-10">
          {[
            { t: "Total Usuarios", v: usuarios.length, icon: <UserCircle className="w-8 h-8 opacity-20" /> },
            { t: "Cuentas Activas", v: usuarios.filter(u => u.es_activo).length, icon: <CheckCircle className="w-8 h-8 opacity-20 text-green-400" /> },
            { t: "Cuentas Inactivas", v: usuarios.filter(u => !u.es_activo).length, icon: <XCircle className="w-8 h-8 opacity-20 text-red-400" /> },
            { t: "Administradores", v: usuarios.filter(u => u.es_administrador).length, icon: <Shield className="w-8 h-8 opacity-20 text-orange-400" /> }
          ].map((c, i) => (
            <div key={i} className="bg-slate-800 text-white p-7 rounded-[2rem] shadow-lg border border-slate-700/50 hover:bg-slate-700 transition-colors group relative overflow-hidden">
              <div className="absolute top-4 right-4 group-hover:scale-110 transition-transform">
                {c.icon}
              </div>
              <p className="text-[10px] font-bold opacity-60 tracking-[0.15em] uppercase mb-3 group-hover:text-blue-300 transition-colors">{c.t}</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">{c.v}</h2>
            </div>
          ))}
        </div>

        {/* TABLA DE USUARIOS */}
        <div className="px-4 md:px-10 pb-4 md:pb-10 flex-1 flex flex-col">
          <div className="bg-white rounded-[2.5rem] shadow-xl p-7 border border-gray-200 flex-1">
            <h3 className="text-2xl font-black text-slate-800 mb-6 tracking-tight px-2">Directorio</h3>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Usuario</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Estado</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Rol</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {usuarios.map((u) => (
                    <tr key={u.id_usuario} className="hover:bg-slate-50 transition-colors duration-200 group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold shadow-sm">
                            {u.nombre.charAt(0)}{u.apellido_paterno?.charAt(0) || ''}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-black text-slate-800 tracking-tight">{u.nombre} {u.apellido_paterno}</div>
                            <div className="text-xs text-slate-500 font-medium">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex items-center text-[10px] font-black rounded-lg uppercase tracking-wider ${u.es_activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {u.es_activo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex items-center text-[10px] font-black rounded-lg uppercase tracking-wider ${u.es_administrador ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                          {u.es_administrador ? 'ADMIN' : 'USUARIO'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          disabled={loading && actionId === u.id_usuario}
                          onClick={() => solicitarConfirmacion(u.id_usuario, u.es_activo ? 'desactivar' : 'activar')}
                          className={`min-w-[110px] px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${u.es_activo
                            ? 'bg-white border-2 border-red-100 text-red-500 hover:bg-red-50'
                            : 'bg-white border-2 border-green-100 text-green-600 hover:bg-green-50'
                            } disabled:opacity-50`}
                        >
                          {loading && actionId === u.id_usuario ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (u.es_activo ? 'Desactivar' : 'Activar')}
                        </button>
                      </td>
                    </tr>
                  ))}
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
        <button onClick={() => navigate('/usuarios')} className="flex flex-col items-center p-2 text-blue-500">
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
            onClick={() => setModal({ isOpen: false, userId: null, action: null })}
          />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 transform transition-all animate-in zoom-in-95 duration-200 text-center">

            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner ${modal.action === 'desactivar' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'
              }`}>
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">¿Confirmar Acción?</h3>
            <p className="text-slate-500 text-sm mb-8 font-medium">
              Estás a punto de <span className="font-bold text-slate-800">{modal.action}</span> a este usuario.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={ejecutarAccion}
                className={`w-full py-3.5 rounded-2xl font-black text-white text-sm uppercase tracking-widest transition-all shadow-md ${modal.action === 'desactivar'
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                  : 'bg-green-500 hover:bg-green-600 shadow-green-200'
                  }`}
              >
                Sí, {modal.action}
              </button>
              <button
                onClick={() => setModal({ isOpen: false, userId: null, action: null })}
                className="w-full py-3.5 rounded-2xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200 text-sm uppercase tracking-widest transition-all"
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