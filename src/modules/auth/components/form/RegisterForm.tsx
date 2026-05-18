import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/register.css";
import { authService } from "../../services/authService";
import { useUI } from "../../../../components/UIProvider";

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  acceptedTerms: boolean;
}

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  isActive: boolean;
}

const RegisterForm = ({ onSwitchToLogin, isActive }: RegisterFormProps) => {
  const navigate = useNavigate();
  const { showToast } = useUI();

  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    telefono: "",
    acceptedTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  /** Validaciones locales completas */
  const validate = (): boolean => {
    const errors: Partial<Record<keyof RegisterFormData, string>> = {};

    if (!formData.nombre.trim())
      errors.nombre = "El nombre es obligatorio";

    if (!formData.apellido_paterno.trim())
      errors.apellido_paterno = "El apellido paterno es obligatorio";

    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "El formato del correo no es válido";
    }

    if (!formData.password) {
      errors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 8) {
      errors.password = "La contraseña debe tener al menos 8 caracteres";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = "Debe incluir al menos una letra mayúscula";
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(formData.password)) {
      errors.password = "Debe incluir al menos un carácter especial";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!formData.acceptedTerms)
      errors.acceptedTerms = "Debes aceptar los términos y condiciones";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validate()) {
      showToast("Revisa los campos con errores antes de continuar", "warning");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.register({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        apellido_paterno: formData.apellido_paterno,
        apellido_materno: formData.apellido_materno,
        telefono: formData.telefono,
      });

      localStorage.setItem("token", result.token);
      localStorage.setItem("usuario", JSON.stringify(result.usuario));

      showToast("¡Cuenta creada exitosamente! Bienvenido a PAZLY 🎉", "success");

      setTimeout(() => navigate("/map"), 1000);

    } catch (err: any) {
      const msg = err.message || "Error al registrarse";
      // Detectar errores comunes del backend
      if (msg.toLowerCase().includes("email") || msg.toLowerCase().includes("correo")) {
        setFieldErrors({ email: "Este correo ya está registrado" });
        showToast("Este correo electrónico ya tiene una cuenta", "error");
      } else {
        showToast(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper para mostrar error de campo
  const FieldError = ({ name }: { name: keyof RegisterFormData }) =>
    fieldErrors[name] ? (
      <span style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px", display: "block" }}>
        ⚠ {fieldErrors[name]}
      </span>
    ) : null;

  return (
    <div className="register-form-container">
      <div className="register-form-section">
        <h2 className="register-form-section__title">Crea tu cuenta</h2>
        <p className="register-form-section__subtitle">
          Ingresa tus datos para continuar
        </p>
      </div>

      <form className="register-form" onSubmit={handleSubmit} noValidate>

        <div className="register-form__field">
          <label className="register-form__label" htmlFor="reg-nombre">Nombre</label>
          <div className="register-form__input-wrapper">
            <input className={`register-form__input${fieldErrors.nombre ? " register-form__input--error" : ""}`}
              id="reg-nombre" type="text" name="nombre"
              value={formData.nombre} onChange={handleChange} placeholder="Ej. Juan" />
          </div>
          <FieldError name="nombre" />
        </div>

        <div className="register-form__field">
          <label className="register-form__label" htmlFor="reg-ap-paterno">Apellido Paterno</label>
          <div className="register-form__input-wrapper">
            <input className={`register-form__input${fieldErrors.apellido_paterno ? " register-form__input--error" : ""}`}
              id="reg-ap-paterno" type="text" name="apellido_paterno"
              value={formData.apellido_paterno} onChange={handleChange} placeholder="Ej. Pérez" />
          </div>
          <FieldError name="apellido_paterno" />
        </div>

        <div className="register-form__field">
          <label className="register-form__label" htmlFor="reg-ap-materno">Apellido Materno</label>
          <div className="register-form__input-wrapper">
            <input className="register-form__input"
              id="reg-ap-materno" type="text" name="apellido_materno"
              value={formData.apellido_materno} onChange={handleChange} placeholder="Ej. López (opcional)" />
          </div>
        </div>

        <div className="register-form__field">
          <label className="register-form__label" htmlFor="reg-email">Correo electrónico</label>
          <div className="register-form__input-wrapper">
            <input className={`register-form__input${fieldErrors.email ? " register-form__input--error" : ""}`}
              id="reg-email" type="email" name="email"
              value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
          </div>
          <FieldError name="email" />
        </div>

        <div className="register-form__field">
          <label className="register-form__label" htmlFor="reg-password">Contraseña</label>
          <div className="register-form__input-wrapper">
            <input className={`register-form__input${fieldErrors.password ? " register-form__input--error" : ""}`}
              id="reg-password" type="password" name="password"
              value={formData.password} onChange={handleChange} placeholder="Mín. 8 caracteres, 1 Mayús, 1 Carácter Especial" />
          </div>
          <FieldError name="password" />
        </div>

        <div className="register-form__field">
          <label className="register-form__label" htmlFor="reg-confirm-password">Confirmar Contraseña</label>
          <div className="register-form__input-wrapper">
            <input className={`register-form__input${fieldErrors.confirmPassword ? " register-form__input--error" : ""}`}
              id="reg-confirm-password" type="password" name="confirmPassword"
              value={formData.confirmPassword} onChange={handleChange} placeholder="Repite tu contraseña" />
          </div>
          <FieldError name="confirmPassword" />
        </div>

        <div className="register-form__checkbox-row">
          <input className="register-form__checkbox" id="reg-terms" type="checkbox"
            name="acceptedTerms" checked={formData.acceptedTerms} onChange={handleChange} />
          <label className="register-form__checkbox-label" htmlFor="reg-terms">
            Acepto los{' '}
            <a href="#terminos" className="register-form__terms-link"
              onClick={(e) => e.preventDefault()}>
              Términos y Condiciones
            </a>
          </label>
        </div>
        {fieldErrors.acceptedTerms && (
          <span style={{ fontSize: "11px", color: "#ef4444", marginTop: "-8px", marginBottom: "8px", display: "block" }}>
            ⚠ {fieldErrors.acceptedTerms}
          </span>
        )}

        <button className="register-form__submit" type="submit" disabled={loading}>
          {loading ? "Creando cuenta..." : "Crear Cuenta"}
        </button>
      </form>

      <p className="register-form__switch-text">
        Ya tienes una cuenta?{" "}
        <button className="register-form__switch-link" type="button" onClick={onSwitchToLogin}>
          Inicia sesión
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;