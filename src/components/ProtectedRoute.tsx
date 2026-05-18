import { Navigate } from 'react-router-dom';

interface Props {
    children: React.ReactNode;
    adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: Props) => {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

    if (!token || !usuario) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !usuario.es_administrador) {
        return <Navigate to="/map" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
