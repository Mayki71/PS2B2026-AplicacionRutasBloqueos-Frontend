import { useEffect, useState } from 'react';
import { getUsuarios } from '../../modules/admin/services/adminService';
import { 
  UserCircle, 
  Shield, 
  Phone, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Loader2,
  AlertTriangle
} from 'lucide-react';

// 1. CONFIGURACIÓN DE URL (Cámbiala aquí si tu backend usa otro puerto)
const API_URL = 'http://localhost:3000';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  
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
    
    // Feedback visual inmediato
    setModal({ isOpen: false, userId: null, action: null });
    setLoading(true);
    setActionId(userId);

    try {
      // 2. LLAMADA CORREGIDA (Usando la URL del servidor)
      const endpoint = `${API_URL}/admin/${action}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      });

      if (!response.ok) throw new Error('Error en el servidor');
      
      // Recargar la lista
      await cargarUsuarios();
    } catch (error) {
      console.error(`Error al ${action}:`, error);
      alert("Hubo un problema al conectar con el servidor.");
    } finally {
      setLoading(false);
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#011627] via-[#0a1b2f] to-[#14213D] p-6 md:p-8 font-sans selection:bg-[#FCA311] selection:text-[#011627] relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Botón Volver Atrás */}
        <button 
          onClick={() => window.history.back()} 
          className="group flex items-center text-[#FDFFFC]/60 hover:text-[#FCA311] transition-all duration-300 mb-8 text-sm font-medium tracking-wide"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1.5 transition-transform duration-300" />
          Volver atrás
        </button>

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FDFFFC] to-[#FDFFFC]/70 mb-3 tracking-tight">
              Gestión de Usuarios
            </h1>
            <p className="text-[#FF9F1C] opacity-90 text-lg font-medium flex items-center">
              <Shield className="w-5 h-5 mr-2 opacity-80" />
              Panel de administración de accesos y roles
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total" value={usuarios.length} icon={<UserCircle className="w-7 h-7 text-[#FCA311]" />} color="border-[#FCA311]/10" />
          <StatCard title="Activos" value={usuarios.filter(u => u.es_activo).length} icon={<CheckCircle className="w-7 h-7 text-green-400" />} color="border-green-500/10" />
          <StatCard title="Inactivos" value={usuarios.filter(u => !u.es_activo).length} icon={<XCircle className="w-7 h-7 text-red-400" />} color="border-red-500/10" />
          <StatCard title="Admins" value={usuarios.filter(u => u.es_administrador).length} icon={<Shield className="w-7 h-7 text-[#FF9F1C]" />} color="border-[#FF9F1C]/10" />
        </div>

        {/* Tabla de Usuarios */}
        <div className="bg-[#14213D]/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#FCA311]/10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FCA311]/30 to-transparent"></div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#011627]/60 border-b border-[#FCA311]/10">
                  <th className="px-6 py-5 text-xs font-bold text-[#FDFFFC]/70 uppercase tracking-widest">Usuario</th>
                  <th className="px-6 py-5 text-xs font-bold text-[#FDFFFC]/70 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-5 text-xs font-bold text-[#FDFFFC]/70 uppercase tracking-widest">Rol</th>
                  <th className="px-6 py-5 text-xs font-bold text-[#FDFFFC]/70 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FCA311]/5">
                {usuarios.map((u) => (
                  <tr key={u.id_usuario} className="hover:bg-[#FCA311]/[0.03] transition-colors duration-300 group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-11 w-11 rounded-full bg-[#FCA311]/10 border border-[#FCA311]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <UserCircle className="h-6 w-6 text-[#FCA311]" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-[#FDFFFC]">{u.nombre} {u.apellido_paterno}</div>
                          <div className="text-xs text-[#FDFFFC]/50">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 inline-flex items-center text-xs font-bold rounded-full border ${
                        u.es_activo ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {u.es_activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full border ${
                        u.es_administrador ? 'bg-[#FCA311]/10 text-[#FCA311] border-[#FCA311]/20' : 'bg-[#FDFFFC]/5 text-[#FDFFFC]/60 border-[#FDFFFC]/10'
                      }`}>
                        {u.es_administrador ? 'ADMIN' : 'USUARIO'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        disabled={loading && actionId === u.id_usuario}
                        onClick={() => solicitarConfirmacion(u.id_usuario, u.es_activo ? 'desactivar' : 'activar')}
                        className={`min-w-[120px] px-4 py-2 rounded-lg font-bold text-xs transition-all border ${
                          u.es_activo 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
                            : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
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

      {/* MODAL DE CONFIRMACIÓN CUSTOM */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#011627]/80 backdrop-blur-sm"
            onClick={() => setModal({ isOpen: false, userId: null, action: null })}
          />
          <div className="relative bg-[#14213D] border border-[#FCA311]/20 rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className={`p-4 rounded-full mb-4 ${modal.action === 'desactivar' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#FDFFFC] mb-2">¿Confirmar Acción?</h3>
              <p className="text-[#FDFFFC]/60 text-sm mb-8">
                Estás a punto de <span className="font-bold text-[#FDFFFC]">{modal.action}</span> este usuario.
                {modal.action === 'desactivar' && ' El acceso será revocado inmediatamente.'}
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setModal({ isOpen: false, userId: null, action: null })}
                  className="flex-1 px-4 py-3 rounded-xl border border-[#FDFFFC]/10 text-[#FDFFFC]/70 font-bold hover:bg-[#FDFFFC]/5 transition-colors"
                >
                  No, cancelar
                </button>
                <button
                  onClick={ejecutarAccion}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all ${
                    modal.action === 'desactivar' ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25' : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/25'
                  }`}
                >
                  Sí, {modal.action}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente pequeño para las cards de arriba
function StatCard({ title, value, icon, color }: any) {
  return (
    <div className={`bg-[#14213D]/60 backdrop-blur-md rounded-2xl p-6 border ${color} shadow-lg transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#FDFFFC]/60 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
          <p className="text-4xl font-bold text-[#FDFFFC]">{value}</p>
        </div>
        <div className="p-3 bg-[#FCA311]/5 rounded-xl">{icon}</div>
      </div>
    </div>
  );
}