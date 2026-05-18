import { useState, type FormEvent, type ChangeEvent } from "react";
import "../../styles/login.css";
import { authService } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useUI } from "../../../../components/UIProvider";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSwitchToRegister: () => void;
  isActive: boolean;
}

const LoginForm = ({ onSwitchToRegister, isActive }: LoginFormProps) => {
  const navigate = useNavigate();
  const { showToast } = useUI();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  // Errores por campo (inline bajo el input)
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginFormData>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error de ese campo al escribir
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  /** Validaciones locales antes de enviar */
  const validate = (): boolean => {
    const errors: Partial<LoginFormData> = {};

    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "El formato del correo no es válido";
    }

    if (!formData.password) {
      errors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validate()) {
      showToast("Completa los campos correctamente", "warning");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", result.token);
      localStorage.setItem("usuario", JSON.stringify(result.usuario));

      showToast(`¡Bienvenido, ${result.usuario.nombre}! 👋`, "success");

      setTimeout(() => {
        if (result.usuario.es_administrador) {
          navigate("/admin");
        } else {
          navigate("/map");
        }
      }, 800);

    } catch (err: any) {
      const msg = err.message || "Email o contraseña incorrectos";
      showToast(msg, "error");
      setFieldErrors({ password: "Verifica tu correo y contraseña" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-form-section">
        <h2 className="login-form-section__title">Iniciar Sesión</h2>
        <p className="login-form-section__subtitle">
          Ingresa tus datos para continuar
        </p>
      </div>

      <form className="login-form" onSubmit={handleSubmit} noValidate>

        <div className="login-form__field">
          <label className="login-form__label">Correo electrónico</label>
          <input
            className={`login-form__input${fieldErrors.email ? " login-form__input--error" : ""}`}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
          />
          {fieldErrors.email && (
            <span style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px", display: "block" }}>
              {fieldErrors.email}
            </span>
          )}
        </div>

        <div className="login-form__field">
          <label className="login-form__label">Contraseña</label>
          <input
            className={`login-form__input${fieldErrors.password ? " login-form__input--error" : ""}`}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
          {fieldErrors.password && (
            <span style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px", display: "block" }}>
              {fieldErrors.password}
            </span>
          )}
        </div>

        <button className="login-form__submit" type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Iniciar Sesión"}
        </button>

      </form>

      <p className="login-form__switch-text">
        No tienes una cuenta?
        <button onClick={onSwitchToRegister}>
          Regístrate
        </button>
      </p>
    </div>
  );
};

export default LoginForm;