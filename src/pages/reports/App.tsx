import { useState } from 'react';
import ReportForm from '../../modules/reports/components/ReportForm';
import ReportList from '../../modules/reports/components/ReportList';
import ReportDetail from '../../modules/reports/components/ReportDetail';

function App() {
  const [vista, setVista] = useState<'form' | 'lista' | 'detalle' | null>(null);
  const [reporteId, setReporteId] = useState<number | null>(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Pruebas modulo Reports</h2>

      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button onClick={() => setVista('form')}>Crear reporte</button>
        <button onClick={() => setVista('lista')}>Mis reportes</button>
        <button onClick={() => setVista(null)}>Cerrar</button>
      </div>

      {vista === 'form' && (
        <ReportForm onClose={() => setVista(null)} onSuccess={() => setVista(null)} />
      )}

      {vista === 'lista' && (
        <ReportList
          onSelectReporte={(id) => {
            setReporteId(id);
            setVista('detalle');
          }}
          onClose={() => setVista(null)}
        />
      )}

      {vista === 'detalle' && reporteId !== null && (
        <ReportDetail id_reporte={reporteId} onBack={() => setVista('lista')} />
      )}
    </div>
  );
}

export default App;