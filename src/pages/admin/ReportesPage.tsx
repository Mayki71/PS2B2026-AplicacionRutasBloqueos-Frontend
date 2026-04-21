import { useEffect, useState } from 'react';
import { getReportes } from '../../modules/admin/services/adminService';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  Loader2, 
  User, 
  Clock,
  ShieldCheck
} from 'lucide-react';

// Centralizamos la URL del backend
const API_URL = 'http://localhost:3000';

export default function ReportesPage() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [loadingAction, setLoadingAction] = useState<number | null>(null);
  
  // Estado para el Modal de confirmación
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
    setModal({ isOpen: false, reporteId: null }); // Cerramos modal
    setLoadingAction(id); // Spinner en la fila

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#011627] via-[#0a1b2f] to-[#14213D] p-6 md:p-8 font-sans selection:bg-[#FCA311] selection:text-[#011627]">
      <div className="max-w-7xl mx-auto">
        
        {/* Botón Volver */}
        <button 
          onClick={() => window.history.back()} 
          className="group flex items-center text-[#FDFFFC]/60 hover:text-[#FCA311] transition-all duration-300 mb-8 text-sm font-medium tracking-wide"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1.5 transition-transform" />
          Volver al Dashboard
        </button>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FDFFFC] to-[#FDFFFC]/70 mb-3 tracking-tight">
            Gestión de Reportes
          </h1>
          <p className="text-[#FF9F1C] opacity-90 text-lg font-medium flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Incidencias y solicitudes de usuarios en tiempo real
          </p>
        </div>

        {/* Tabla Estilo Premium */}
        <div className="bg-[#14213D]/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#FCA311]/10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FCA311]/30 to-transparent"></div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#011627]/60 border-b border-[#FCA311]/10">
                  <th className="px-6 py-5 text-xs font-bold text-[#FDFFFC]/70 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-5 text-xs font-bold text-[#FDFFFC]/70 uppercase tracking-widest">Usuario</th>
                  <th className="px-6 py-5 text-xs font-bold text-[#FDFFFC]/70 uppercase tracking-widest">Descripción</th>
                  <th className="px-6 py-5 text-xs font-bold text-[#FDFFFC]/70 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-5 text-xs font-bold text-[#FDFFFC]/70 uppercase tracking-widest text-right">Acción</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-[#FCA311]/5">
                {reportes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#FDFFFC]/30 italic">
                      No hay reportes pendientes de revisión.
                    </td>
                  </tr>
                ) : (
                  reportes.map((r) => (
                    <tr key={r.id_reporte} className="hover:bg-[#FCA311]/[0.03] transition-colors duration-300 group">
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-[#FDFFFC]/50">
                        #{r.id_reporte.toString().padStart(4, '0')}
                      </td>
                      
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#FCA311]/20 to-[#FF9F1C]/20 border border-[#FCA311]/20 flex items-center justify-center text-[#FCA311] mr-3">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="text-sm font-bold text-[#FDFFFC]">
                            {r.usuarios?.nombre} {r.usuarios?.apellido_paterno}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 max-w-xs">
                        <p className="text-sm text-[#FDFFFC]/80 line-clamp-2 leading-relaxed">
                          {r.descripcion}
                        </p>
                      </td>

                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1.5 inline-flex items-center text-[10px] font-bold rounded-full border shadow-sm ${
                          r.estados_reporte?.id_estado === 2
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {r.estados_reporte?.id_estado === 2 ? (
                            <CheckCircle className="w-3 h-3 mr-1.5" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1.5" />
                          )}
                          {r.estados_reporte?.nombre_estado.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        {r.estados_reporte?.id_estado !== 2 && (
                          <button
                            disabled={loadingAction === r.id_reporte}
                            onClick={() => confirmarResolucion(r.id_reporte)}
                            className="bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white border border-green-500/20 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 disabled:opacity-30 flex items-center ml-auto"
                          >
                            {loadingAction === r.id_reporte ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <ShieldCheck className="w-4 h-4 mr-1.5" />
                                Resolver
                              </>
                            )}
                          </button>
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

      {/* MODAL DE CONFIRMACIÓN PREMIUM */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#011627]/90 backdrop-blur-md transition-opacity"
            onClick={() => setModal({ isOpen: false, reporteId: null })}
          />
          
          <div className="relative bg-[#14213D] border border-[#FCA311]/20 rounded-3xl shadow-2xl w-full max-w-sm p-8 transform transition-all animate-in zoom-in-95 duration-200 text-center">
            <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10" />
            </div>
            
            <h3 className="text-2xl font-bold text-[#FDFFFC] mb-2">¿Resolver Reporte?</h3>
            <p className="text-[#FDFFFC]/60 text-sm mb-8">
              Marcarás esta incidencia como resuelta. El usuario podrá ver el cambio de estado.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setModal({ isOpen: false, reporteId: null })}
                className="flex-1 px-4 py-3 rounded-xl border border-[#FDFFFC]/10 text-[#FDFFFC]/70 font-bold hover:bg-[#FDFFFC]/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarResolucion}
                className="flex-1 px-4 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-all shadow-lg shadow-green-500/20"
              >
                Sí, resolver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}