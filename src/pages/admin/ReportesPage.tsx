import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getReportes, resolverReporte, eliminarComentario, desactivarUsuario } from '../../modules/admin/services/adminService';
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
  MessageSquare,
  UserX,
  AlertTriangle
} from 'lucide-react';

export default function ReportesPage() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [selectedReporte, setSelectedReporte] = useState<any | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [loadingAction, setLoadingAction] = useState<number | null>(null);
  const [loadingComment, setLoadingComment] = useState<number | null>(null);
  const [loadingBan, setLoadingBan] = useState<number | null>(null);
  const [highlightedComment, setHighlightedComment] = useState<number | null>(null);
  
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'resolver' | 'eliminarComentario' | 'banear' | null;
    targetId: number | null;
  }>({
    isOpen: false,
    type: null,
    targetId: null
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useUI();

  useEffect(() => {
    cargarReportes();
    const interval = setInterval(cargarReportes, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rId = params.get('reporteId');
    const cId = params.get('comentarioId');

    if (rId && reportes.length > 0) {
      const rep = reportes.find(r => r.id_reporte === parseInt(rId, 10));
      if (rep && (!selectedReporte || selectedReporte.id_reporte !== rep.id_reporte)) {
        setSelectedReporte(rep);
        
        if (mapInstance && rep.ubicaciones) {
          mapInstance.flyTo({ center: [rep.ubicaciones.longitud, rep.ubicaciones.latitud], zoom: 15, speed: 1.5 });
        }
      }

      if (cId) {
        const commentId = parseInt(cId, 10);
        setHighlightedComment(commentId);
        
        setTimeout(() => {
          const el = document.getElementById(`comentario-${commentId}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);

        setTimeout(() => setHighlightedComment(null), 4000);
      }
    }
  }, [location.search, reportes, mapInstance]);

  const cargarReportes = async () => {
    try {
      const data = await getReportes();
      if (!data) return;
      setReportes(data);
    } catch (error) {
      console.error("Error al cargar reportes:", error);
    }
  };

  // Sincronizar el reporte seleccionado cuando la lista cambia (Real-time)
  useEffect(() => {
    if (selectedReporte) {
      const updated = reportes.find(r => r.id_reporte === selectedReporte.id_reporte);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedReporte)) {
        setSelectedReporte(updated);
      }
    }
  }, [reportes, selectedReporte]);

  const handleMapReady = (map: mapboxgl.Map) => {
    setMapInstance(map);
  };

  const handleSelectReporte = (id: number) => {
    const report = reportes.find(r => r.id_reporte === id);
    setSelectedReporte(report || null);
  };

  const solicitarAccion = (type: 'resolver' | 'eliminarComentario' | 'banear', targetId: number) => {
    setModal({ isOpen: true, type, targetId });
  };

  const ejecutarAccion = async () => {
    if (!modal.targetId || !modal.type) return;
    
    const { type, targetId } = modal;
    setModal({ isOpen: false, type: null, targetId: null });

    if (type === 'resolver') {
      setLoadingAction(targetId);
      try {
        await resolverReporte(targetId);
        showToast('Reporte marcado como resuelto', 'success');
        await cargarReportes();
      } catch (error) {
        showToast('Error al resolver', 'error');
      } finally {
        setLoadingAction(null);
      }
    } else if (type === 'eliminarComentario') {
      setLoadingComment(targetId);
      try {
        await eliminarComentario(targetId);
        showToast('Comentario eliminado', 'success');
        await cargarReportes();
      } catch (error) {
        showToast('Error al eliminar comentario', 'error');
      } finally {
        setLoadingComment(null);
      }
    } else if (type === 'banear') {
      setLoadingBan(targetId);
      try {
        await desactivarUsuario(targetId);
        showToast('Usuario baneado correctamente', 'success');
      } catch (error) {
        showToast('Error al banear usuario', 'error');
      } finally {
        setLoadingBan(null);
      }
    }
  };

  return (
    <div className="flex h-[100dvh] bg-gray-100 font-sans antialiased text-slate-900 overflow-hidden">
      {/* SIDEBAR (Desktop) */}
      <div className="hidden md:flex w-72 bg-gray-200 p-7 flex-col shadow-inner z-10 border-r border-gray-300">
        <h2 className="text-4xl font-black tracking-tighter text-slate-800 mb-1 italic">PAZLY</h2>
        <p className="text-[10px] font-bold text-gray-500 mb-10 uppercase tracking-[0.2em]">Soporte y Vigilancia</p>

        <p className="text-gray-400 text-[11px] font-extrabold mb-4 tracking-widest mt-4">Navegación</p>

        <div onClick={() => navigate('/admin')} className="flex items-center px-5 py-3 text-slate-600 hover:bg-gray-300 hover:text-slate-900 font-bold rounded-2xl cursor-pointer transition-all mb-3">
          <LayoutDashboard className="w-5 h-5 mr-3 opacity-70" />
          Dashboard
        </div>

        <div onClick={() => navigate('/usuarios')} className="flex items-center px-5 py-3 text-slate-600 hover:bg-gray-300 hover:text-slate-900 font-bold rounded-2xl cursor-pointer transition-all mb-3">
          <Users className="w-5 h-5 mr-3 opacity-70" />
          Usuarios
        </div>

        <p className="text-gray-400 text-[11px] font-extrabold mt-8 mb-4 tracking-widest">Administración</p>

        <div className="flex items-center bg-[#FCA311] text-white px-5 py-3 rounded-2xl mb-1 cursor-pointer font-bold shadow-md hover:bg-[#e5940f] transition-all active:scale-95">
          <FileText className="w-5 h-5 mr-3" />
          Reportes
        </div>
        <div className="flex-1"></div>

        <div className="mt-auto pt-10">
          <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="w-full flex items-center px-5 py-3 text-red-500 hover:bg-red-50 font-bold rounded-2xl transition-all">
            <XCircle className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* MAPA (Izquierda) */}
        <div className="flex-1 h-full relative">
          <MapView onMapReady={handleMapReady} mapStyle="standard" />
          {mapInstance && (
              <MapBlockages
              map={mapInstance}
              reportes={reportes}
              tiposFiltro={[]}
              onSelectReporte={handleSelectReporte}
            />
          )}
        </div>

        {/* DETALLES (Derecha) */}
        <div className="w-full md:w-[450px] h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col z-10">
          <div className="bg-[#FCA311] text-white p-6 shadow-md shrink-0">
            <h2 className="text-2xl font-black tracking-tight">Gestión de Reporte</h2>
            <p className="text-white/80 text-sm font-medium">Selecciona un reporte en el mapa</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 custom-scrollbar">
            {!selectedReporte ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                <Search className="w-16 h-16 mb-4" />
                <p className="font-bold text-center">Toca un marcador en el mapa para ver los detalles e interactuar.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Info Card */}
                <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID #{selectedReporte.id_reporte}</span>
                    <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${selectedReporte.id_estado === 2 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {selectedReporte.estados_reporte?.nombre_estado || 'ACTIVO'}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-800 leading-tight mb-2">
                    {selectedReporte.tipos_bloqueo?.nombre || 'Bloqueo'}
                  </h3>
                  
                  {selectedReporte.tiene_imagenes && selectedReporte.imagen_principal_url && (
                    <div className="w-full h-48 mb-4 rounded-xl overflow-hidden border border-gray-200 bg-slate-100 flex items-center justify-center">
                      <img 
                        src={selectedReporte.imagen_principal_url} 
                        alt="Imagen del bloqueo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  <p className="text-sm text-slate-600 font-medium mb-4">{selectedReporte.descripcion}</p>

                  <div className="flex items-center text-xs text-slate-500 font-bold">
                    <User className="w-4 h-4 mr-2" />
                    Por: {selectedReporte.usuarios?.nombre} {selectedReporte.usuarios?.apellido_paterno}
                  </div>
                </div>

                {/* Acciones */}
                {selectedReporte.id_estado !== 2 && (
                  <button 
                    onClick={() => solicitarAccion('resolver', selectedReporte.id_reporte)}
                    disabled={loadingAction === selectedReporte.id_reporte}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest py-3 rounded-xl flex items-center justify-center transition-all shadow-md shadow-green-200"
                  >
                    {loadingAction === selectedReporte.id_reporte ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5 mr-2" /> Marcar como Resuelto</>}
                  </button>
                )}

                {/* Comentarios */}
                <div className="mt-8">
                  <h4 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-widest flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-[#FCA311]" />
                    Comentarios
                  </h4>

                  <div className="space-y-3">
                    {(!selectedReporte.comentarios || selectedReporte.comentarios.length === 0) ? (
                      <p className="text-xs text-slate-400 font-medium italic text-center py-4">No hay comentarios en este reporte.</p>
                    ) : (
                      selectedReporte.comentarios.map((c: any) => (
                        <div 
                          key={c.id_comentario} 
                          id={`comentario-${c.id_comentario}`}
                          className={`bg-white p-4 rounded-2xl border ${
                            highlightedComment === c.id_comentario ? 'border-[#FCA311] shadow-[0_0_15px_rgba(252,163,17,0.4)] animate-pulse' : 'border-gray-100 shadow-sm'
                          } relative group pr-20 transition-all duration-500`}
                        >
                          <p className="text-xs font-bold text-slate-800 mb-1">{c.usuarios?.nombre} {c.usuarios?.apellido_paterno}</p>
                          <p className="text-xs text-slate-600 mb-2">{c.comentario}</p>
                          <p className="text-[9px] text-slate-400">{new Date(c.fecha_comentario).toLocaleString()}</p>
                          
                          <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => solicitarAccion('banear', c.id_usuario)}
                              disabled={loadingBan === c.id_usuario}
                              className="text-orange-400 hover:text-white hover:bg-[#FCA311] p-1.5 rounded-lg transition-all"
                              title="Banear Usuario"
                            >
                              {loadingBan === c.id_usuario ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => solicitarAccion('eliminarComentario', c.id_comentario)}
                              disabled={loadingComment === c.id_comentario}
                              className="text-red-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                              title="Eliminar Comentario"
                            >
                              {loadingComment === c.id_comentario ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setModal({ isOpen: false, type: null, targetId: null })}
          />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 transform transition-all animate-in zoom-in-95 duration-200 text-center">

            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner ${
              modal.type === 'resolver' ? 'bg-green-100 text-green-500' :
              modal.type === 'banear' ? 'bg-orange-100 text-orange-500' :
              'bg-red-100 text-red-500'
            }`}>
              {modal.type === 'resolver' ? <CheckCircle className="w-8 h-8" /> : 
               modal.type === 'banear' ? <UserX className="w-8 h-8" /> :
               <Trash2 className="w-8 h-8" />}
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">¿Confirmar Acción?</h3>
            <p className="text-slate-500 text-sm mb-8 font-medium">
              {modal.type === 'resolver' && '¿Estás seguro de que deseas marcar este reporte como resuelto?'}
              {modal.type === 'banear' && '¿Estás seguro de que deseas banear a este usuario del sistema?'}
              {modal.type === 'eliminarComentario' && '¿Estás seguro de que deseas eliminar este comentario permanentemente?'}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={ejecutarAccion}
                className={`w-full py-3.5 rounded-2xl font-black text-white text-sm uppercase tracking-widest transition-all shadow-md ${
                  modal.type === 'resolver' ? 'bg-green-500 hover:bg-green-600 shadow-green-200' :
                  modal.type === 'banear' ? 'bg-[#FCA311] hover:bg-[#e5940f] shadow-orange-200' :
                  'bg-red-500 hover:bg-red-600 shadow-red-200'
                }`}
              >
                Sí, Confirmar
              </button>
              <button
                onClick={() => setModal({ isOpen: false, type: null, targetId: null })}
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