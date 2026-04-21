import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsuariosPage from './pages/admin/UsuariosPage';
import ReportesPage from './pages/admin/ReportesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;