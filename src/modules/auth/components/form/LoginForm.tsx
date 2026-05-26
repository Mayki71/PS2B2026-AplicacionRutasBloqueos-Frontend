import { useState, useEffect, } from "react";
import type { FormEvent, ChangeEvent } from "react";
import "../../styles/login.css";
import { authService } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useUI } from "../../../../components/UIProvider";
import { useFormValidation } from "../../hooks/useFormValidation";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSwitchToRegister: () => void;
  isActive: boolean;
}

function validateLoginFields(data: LoginFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.email.trim()) {
    errors.email = "El correo electrónico es obligatorio";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "El correo electrónico no es válido";
  }
  if (!data.password) {
    errors.password = "La contraseña es obligatoria";
  }
  return errors;
}

const LoginForm = ({ onSwitchToRegister, isActive }: LoginFormProps) => {
  const navigate = useNavigate();
  const { showToast } = useUI();

  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const { resetValidation } = useFormValidation(["email", "password"]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("expired") === "true") {
      setServerError("Tu sesión expiró, vuelve a iniciar sesión");
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError(null);
    setEmailNotVerified(false);
    if (touched[name]) {
      const errs = validateLoginFields({ ...formData, [name]: value });
      setLocalErrors((prev) => ({ ...prev, [name]: errs[name] ?? "" }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validateLoginFields({ ...formData, [name]: value });
    setLocalErrors((prev) => ({ ...prev, [name]: errs[name] ?? "" }));
  };

  const hasFieldError = (name: string): boolean =>
    touched[name] === true && !!localErrors[name];

  const getError = (name: string): string => localErrors[name] ?? "";

  const handleResendVerification = async () => {
    setResending(true);
    setResendSuccess(false);
    try {
      await authService.resendVerification(formData.email);
      setResendSuccess(true);
      showToast("Email de verificación reenviado", "success");
    } catch (err: any) {
      const msg = err.message || "Error al reenviar el email";
      setServerError(msg);
      showToast(msg, "error");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setServerError(null);
    setEmailNotVerified(false);

    const errs = validateLoginFields(formData);
    setLocalErrors(errs);
    setTouched({ email: true, password: true });

    if (Object.keys(errs).length > 0) {
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
      resetValidation();
      showToast(`¡Bienvenido, ${result.usuario.nombre}! 👋`, "success");

      setTimeout(() => {
        if (result.usuario.es_administrador) {
          navigate("/admin");
        } else {
          navigate("/map");
        }
      }, 800);
    } catch (err: any) {
      if (err.message === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(true);
      } else {
        const msg = err.message || "Email o contraseña incorrectos";
        setServerError(msg);
        showToast(msg, "error");
      }
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

      {serverError && (
        <div className="form-server-error" role="alert">
          {serverError}
        </div>
      )}

      {emailNotVerified && (
        <div className="form-not-verified" role="alert">
          <p>Tu email no está verificado. Revisá tu bandeja de entrada.</p>
          {resendSuccess ? (
            <span className="form-not-verified__success">✓ Email reenviado</span>
          ) : (
            <button
              className="form-not-verified__btn"
              onClick={handleResendVerification}
              disabled={resending || !formData.email}
              type="button"
            >
              {resending ? "Reenviando..." : "Reenviar email de verificación"}
            </button>
          )}
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className={`login-form__field${hasFieldError("email") ? " login-form__field--error" : ""}`}>
          <label className="login-form__label" htmlFor="login-email">
            Correo electrónico
          </label>
          <div className="login-form__input-wrapper">
            <input
              className={`login-form__input${hasFieldError("email") ? " login-form__input--error" : ""}`}
              id="login-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              aria-invalid={hasFieldError("email")}
              aria-describedby={hasFieldError("email") ? "login-email-error" : undefined}
            />
          </div>
          {hasFieldError("email") && (
            <span className="form-field-error" id="login-email-error" role="alert">
              {getError("email")}
            </span>
          )}
        </div>

        <div className={`login-form__field${hasFieldError("password") ? " login-form__field--error" : ""}`}>
          <label className="login-form__label" htmlFor="login-password">
            Contraseña
          </label>
          <div className="login-form__input-wrapper" style={{ position: 'relative' }}>
            <input
              className={`login-form__input${hasFieldError("password") ? " login-form__input--error" : ""}`}
              id="login-password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{ paddingRight: '40px' }}
              aria-invalid={hasFieldError("password")}
              aria-describedby={hasFieldError("password") ? "login-password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {hasFieldError("password") && (
            <span className="form-field-error" id="login-password-error" role="alert">
              {getError("password")}
            </span>
          )}
        </div>

        <button
          className="login-form__submit"
          type="submit"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Iniciar Sesión"}
        </button>
      </form>

      <p className="login-form__switch-text">
        ¿No tienes cuenta?{" "}
        <button
          className="login-form__switch-link"
          type="button"
          onClick={onSwitchToRegister}
        >
          Regístrate
        </button>
      </p>
    </div>
  );
};

export default LoginForm;