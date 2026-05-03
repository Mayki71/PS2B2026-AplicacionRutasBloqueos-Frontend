import { useState, useCallback } from 'react';
import "./App.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import mapboxgl from 'mapbox-gl';
import { MapPin, CheckCircle } from 'lucide-react';

import MapPage from './pages/map/MapPage';
import ReportForm from './modules/reports/components/ReportForm';
import ReportList from './modules/reports/components/ReportList';
import ReportDetail from './modules/reports/components/ReportDetail';
import MapBlockages from './modules/map/components/MapBlockages';
import BlockageFilter from './modules/map/components/BlockageFilter';

import AdminDashboard from './pages/admin/AdminDashboard';
import UsuariosPage from './pages/admin/UsuariosPage';
import ReportesPage from './pages/admin/ReportesPage';
import LandingPage from './pages/auth/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import { useReportes } from './modules/reports/hooks/useReports';
import { getTiposBloqueo } from './modules/reports/services/reportsService';
import { useEffect } from 'react';
import type { TipoBloqueo } from './modules/reports/reports.types';

type Vista = 'form' | 'lista' | 'detalle' | null;

function MapWithReports() {
  const [vista, setVista]         = useState<Vista>(null);
  const [reporteId, setReporteId] = useState<number | null>(null);
  const [coordsA, setCoordsA]     = useState<[number, number] | null>(null);
  const [coordsB, setCoordsB]     = useState<[number, number] | null>(null);
  const [initCoords, setInitCoords] = useState<{ lat: number; lng: number; direccion?: string } | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [tiposFiltro, setTiposFiltro] = useState<number[]>([]);
  const [tiposBloqueo, setTiposBloqueo] = useState<TipoBloqueo[]>([]);

  const { reportes, refetch } = useReportes();

  useEffect(() => { getTiposBloqueo().then(setTiposBloqueo); }, []);

  const cerrar = () => {
    setVista(null); setCoordsA(null); setCoordsB(null); setInitCoords(null);
  };

  const abrirFormConCoords = (lat: number, lng: number, direccion?: string) => {
    setInitCoords({ lat, lng, direccion });
    setCoordsA([lng, lat]); setCoordsB(null);
    setVista('form');
  };

  const handleMarkPoints = (a: [number, number] | null, b: [number, number] | null) => {
    setCoordsA(a); setCoordsB(b);
  };

  const handleMapReady = useCallback((map: mapboxgl.Map) => {
    setMapInstance(map);
  }, []);

  const abrirDetalle = (id: number) => {
    setReporteId(id);
    setVista('detalle');
  };

  const isFormOpen  = vista === 'form';
  const isListaOpen = vista === 'lista';
  const isDetalle   = vista === 'detalle' && reporteId !== null;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>

      {/* ── LAYOUT principal ──────────────────────────────────── */}
      <style>{`
        .create-container { display: flex; flex-direction: column; width: 100%; height: 100%; position: absolute; inset: 0; }
        .create-map { width: 100%; height: ${isFormOpen ? '40%' : '100%'}; position: relative; flex: none; transition: all 0.3s ease; }
        .create-info { width: 100%; height: 60%; position: relative; background: #FCA311; display: flex; flex-direction: column; overflow-y: auto; z-index: 50; box-shadow: -8px 0 32px rgba(0,0,0,0.25); }
        
        @media (min-width: 768px) {
          .create-container { flex-direction: row; }
          .create-map { width: ${isFormOpen ? '60%' : '100%'}; height: 100%; }
          .create-info { width: 40%; height: 100%; }
        }
      `}</style>
      <div className="create-container">

        {/* Mapa: 60% cuando form abierto, 100% normal */}
        <div className="create-map">
          <MapPage
            onReportHere={abrirFormConCoords}
            reportMode={isFormOpen}
            onMarkPoints={handleMarkPoints}
            onMapReady={handleMapReady}
          />

          {/* Bloqueos dibujados en el mapa */}
          {!isFormOpen && (
            <MapBlockages
              map={mapInstance}
              reportes={reportes}
              tiposFiltro={tiposFiltro}
              onSelectReporte={abrirDetalle}
            />
          )}
        </div>

        {/* Panel formulario lateral (40%) */}
        {isFormOpen && (
          <div className="create-info">
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px 20px', background: 'rgba(0,0,0,0.15)',
              borderBottom: '1px solid rgba(255,255,255,0.2)', flexShrink: 0,
            }}>
              <button style={{
                background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: '50%',
                width: '36px', height: '36px', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
              }} onClick={cerrar}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <div>
                <span style={{ fontSize: '17px', fontWeight: 800, color: '#fff', display: 'block' }}>
                  Crear Reporte
                </span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {coordsA && coordsB ? <><CheckCircle size={12} /> Tramo marcado en el mapa</>
                    : coordsA ? <><MapPin size={12} /> Marca el punto B en el mapa</>
                    : <><MapPin size={12} /> Toca el mapa para marcar punto A</>}
                </span>
              </div>
            </div>
            <ReportForm
              coordsA={coordsA}
              coordsB={coordsB}
              initialDireccion={initCoords?.direccion}
              onClose={cerrar}
              onSuccess={() => { cerrar(); refetch(); }}
            />
          </div>
        )}
      </div>

      {/* ── FABs ──────────────────────────────────────────────── */}
      {vista === null && (
        <div style={S.fab}>
          <button style={S.fabBtn} onClick={() => setVista('form')} title="Crear reporte">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button style={S.fabBtnSecondary} onClick={() => setVista('lista')} title="Mis reportes">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Filtros de bloqueos (visibles en modo normal) ─────── */}
      {vista === null && tiposBloqueo.length > 0 && (
        <BlockageFilter
          tipos={tiposBloqueo}
          activos={tiposFiltro}
          onChange={setTiposFiltro}
        />
      )}

      {/* ── Modal lista ───────────────────────────────────────── */}
      {isListaOpen && (
        <div style={S.modalOverlay} onClick={cerrar}>
          <div style={S.modalSheet} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <button style={S.closeBtn} onClick={cerrar}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <span style={S.modalTitle}>Mis Reportes</span>
            </div>
            <div style={S.modalBody}>
              <ReportList
                onSelectReporte={(id) => { setReporteId(id); setVista('detalle'); }}
                onClose={cerrar}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Panel detalle (full screen sobre el mapa) ──────────── */}
      {isDetalle && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: '#FCA311',
        }}>
          <ReportDetail
            id_reporte={reporteId!}
            onBack={() => {
              setVista(vista === 'detalle' && isListaOpen ? 'lista' : null);
              setReporteId(null);
            }}
            onDeleted={() => { refetch(); cerrar(); }}
          />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/map" element={<ProtectedRoute><MapWithReports /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute adminOnly><UsuariosPage /></ProtectedRoute>} />
        <Route path="/reportes" element={<ProtectedRoute adminOnly><ReportesPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

const S = {
  fab: {
    position: 'fixed' as const,
    bottom: '90px', left: '16px',
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', gap: '10px', zIndex: 30,
  },
  fabBtn: {
    width: '56px', height: '56px', borderRadius: '50%',
    background: '#FCA311', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(249,115,22,0.5)', transition: 'transform 0.15s',
  },
  fabBtnSecondary: {
    width: '44px', height: '44px', borderRadius: '50%',
    background: '#1a1a2e', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)', transition: 'transform 0.15s',
  },
  modalOverlay: {
    position: 'fixed' as const, inset: 0, zIndex: 200,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'flex-end',
  },
  modalSheet: {
    width: '100%', maxHeight: '90vh', background: '#FCA311',
    borderRadius: '20px 20px 0 0',
    display: 'flex', flexDirection: 'column' as const,
    overflow: 'hidden', boxShadow: '0 -8px 32px rgba(0,0,0,0.25)',
  },
  modalHeader: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '16px 20px', background: '#FCA311',
    borderBottom: '1px solid rgba(255,255,255,0.2)', flexShrink: 0,
  },
  closeBtn: {
    background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: '50%',
    width: '32px', height: '32px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  modalTitle: { fontSize: '18px', fontWeight: 700, color: '#fff' },
  modalBody: { flex: 1, overflowY: 'auto' as const },
};