import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import "../../styles/profile.css";
import { ArrowLeft } from "lucide-react";

interface EditFormData {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
}

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EditFormData>({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    telefono: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Precargar datos desde localStorage para respuesta rápida
    const cached = localStorage.getItem("usuario");
    if (cached) {
      const u = JSON.parse(cached);
      setFormData({
        nombre: u.nombre ?? "",
        apellido_paterno: u.apellido_paterno ?? "",
        apellido_materno: u.apellido_materno ?? "",
        telefono: u.telefono ?? "",
      });
      setLoading(false);
    }

    // Luego actualizar desde el backend
    authService.getMe()
      .then((data: any) => {
        setFormData({
          nombre: data.nombre ?? "",
          apellido_paterno: data.apellido_paterno ?? "",
          apellido_materno: data.apellido_materno ?? "",
          telefono: data.telefono ?? "",
        });
      })
      .catch((err: any) => {
        if (err.message?.includes("401")) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          navigate("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar mensajes al editar
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setSaving(true);

    try {
      const updated = await authService.updateMe({
        nombre: formData.nombre,
        apellido_paterno: formData.apellido_paterno,
        apellido_materno: formData.apellido_materno,
        telefono: formData.telefono || undefined,
      });

      // Actualizar localStorage con los nuevos datos
      const cached = localStorage.getItem("usuario");
      if (cached) {
        const prev = JSON.parse(cached);
        localStorage.setItem("usuario", JSON.stringify({ ...prev, ...updated }));
      }

      setSuccessMessage("¡Perfil actualizado correctamente!");

      setTimeout(() => navigate("/perfil"), 1500);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading__spinner" />
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-header">
        <div className="edit-profile-header__inner">
          <button className="profile-back" onClick={() => navigate("/perfil")}>
            <ArrowLeft size={16} />
            Volver
          </button>
          <h1 className="edit-profile-header__title">Editar Perfil</h1>
        </div>
      </div>

      <div className="edit-profile-content">
        <div className="edit-profile-card">
          <h2 className="edit-profile-card__title">Datos personales</h2>

          {successMessage && (
            <div className="edit-profile-success" role="status">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="edit-profile-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errorMessage}
            </div>
          )}

          <form className="edit-profile-form" onSubmit={handleSubmit} noValidate>
            <div className="edit-profile-field">
              <label className="edit-profile-label" htmlFor="edit-nombre">Nombre</label>
              <input
                className="edit-profile-input"
                id="edit-nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                disabled={saving}
              />
            </div>

            <div className="edit-profile-field--row">
              <div className="edit-profile-field">
                <label className="edit-profile-label" htmlFor="edit-ap-paterno">Apellido Paterno</label>
                <input
                  className="edit-profile-input"
                  id="edit-ap-paterno"
                  type="text"
                  name="apellido_paterno"
                  value={formData.apellido_paterno}
                  onChange={handleChange}
                  placeholder="Apellido paterno"
                  disabled={saving}
                />
              </div>
              <div className="edit-profile-field">
                <label className="edit-profile-label" htmlFor="edit-ap-materno">Apellido Materno</label>
                <input
                  className="edit-profile-input"
                  id="edit-ap-materno"
                  type="text"
                  name="apellido_materno"
                  value={formData.apellido_materno}
                  onChange={handleChange}
                  placeholder="Apellido materno"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="edit-profile-field">
              <label className="edit-profile-label" htmlFor="edit-telefono">Teléfono (+591)</label>
              <input
                className="edit-profile-input"
                id="edit-telefono"
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="71234567"
                disabled={saving}
              />
            </div>

            <div className="edit-profile-actions">
              <button
                className="edit-profile-btn edit-profile-btn--primary"
                type="submit"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                className="edit-profile-btn edit-profile-btn--secondary"
                type="button"
                onClick={() => navigate("/perfil")}
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;