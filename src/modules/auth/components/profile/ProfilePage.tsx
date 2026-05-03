import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import "../../styles/profile.css";
import { ArrowLeft } from "lucide-react";

interface Usuario {
  id?: number;
  auth_id: string;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono?: string;
  es_activo?: boolean;
  es_administrador?: boolean;
  fecha_registro?: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Intentar cargar desde localStorage primero para respuesta rápida
    const cached = localStorage.getItem("usuario");
    if (cached) {
      setUsuario(JSON.parse(cached));
      setLoading(false);
    }

    // Luego actualizar desde el backend
    authService.getMe()
      .then((data) => {
        setUsuario(data);
        localStorage.setItem("usuario", JSON.stringify(data));
      })
      .catch((err) => {
        // Si el token expiró
        if (err.message?.includes("401") || err.message?.includes("Unauthorized")) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          navigate("/login");
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const getInitials = (u: Usuario) => {
    const n = u.nombre?.[0] ?? "";
    const a = u.apellido_paterno?.[0] ?? "";
    return (n + a).toUpperCase();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-BO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading__spinner" />
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <p>Error al cargar el perfil: {error}</p>
        <button onClick={() => navigate("/")}>Volver al inicio</button>
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-header__inner">
          <button className="profile-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Volver
          </button>
          <h1 className="profile-header__title">Mi Perfil</h1>
        </div>
      </div>

      <div className="profile-content">
        {/* Card principal */}
        <div className="profile-card">
          {/* Avatar + nombre */}
          <div className="profile-card__hero">
            <div className="profile-avatar">
              <span className="profile-avatar__initials">{getInitials(usuario)}</span>
              <div className="profile-avatar__ring" />
            </div>
            <div className="profile-card__identity">
              <h2 className="profile-card__name">
                {usuario.nombre} {usuario.apellido_paterno} {usuario.apellido_materno}
              </h2>
              <span className="profile-card__email">{usuario.email}</span>
              {usuario.es_administrador && (
                <span className="profile-badge profile-badge--admin">Administrador</span>
              )}
              {!usuario.es_administrador && (
                <span className="profile-badge profile-badge--user">Usuario</span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="profile-divider" />

          {/* Datos */}
          <div className="profile-fields">
            <div className="profile-field">
              <span className="profile-field__label">Nombre</span>
              <span className="profile-field__value">{usuario.nombre}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field__label">Apellido Paterno</span>
              <span className="profile-field__value">{usuario.apellido_paterno}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field__label">Apellido Materno</span>
              <span className="profile-field__value">{usuario.apellido_materno}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field__label">Correo electrónico</span>
              <span className="profile-field__value">{usuario.email}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field__label">Teléfono</span>
              <span className="profile-field__value">{usuario.telefono ?? "—"}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field__label">Miembro desde</span>
              <span className="profile-field__value">{formatDate(usuario.fecha_registro)}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="profile-divider" />

          {/* Acciones */}
          <div className="profile-actions">
            <button
              className="profile-btn profile-btn--primary"
              onClick={() => navigate("/perfil/editar")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar perfil
            </button>
            <button
              className="profile-btn profile-btn--danger"
              onClick={handleLogout}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;