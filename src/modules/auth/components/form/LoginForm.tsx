import { useState, FormEvent, ChangeEvent } from "react";
import "../../styles/login.css";
import { authService } from "../../services/authService";
import { useFormValidation } from "../../hooks/useFormValidation";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSwitchToRegister: () => void;
  isActive: boolean;
}

const LoginForm = ({ onSwitchToRegister, isActive }: LoginFormProps) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    errors,
    touchField,
    validateAll,
    setServerFieldErrors,
    hasVisibleError,
    hasAnyError,
    resetValidation,
  } = useFormValidation(["email", "password"]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    touchField(name, value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    touchField(e.target.name, e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setServerError(null);

    const isValid = validateAll({
      email: formData.email,
      password: formData.password,
    });
    if (!isValid) return;

    setLoading(true);
    try {
      const result: any = await authService.login({
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem("token", result.token);
      localStorage.setItem("usuario", JSON.stringify(result.usuario));
      resetValidation();
      setSuccessMessage("¡Sesión iniciada correctamente!");
    } catch (err: any) {
      setServerError(err.message || "Error de conexión, intentá de nuevo");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (): void => {
    console.log("Forgot password clicked");
  };

  return (
    <div className="login-form-container">
      <div className="login-form-section">
        <h2 className="login-form-section__title">Iniciar Sesion</h2>
        <p className="login-form-section__subtitle">
          Ingresa tus datos para continuar
        </p>
      </div>

      {serverError && <div className="form-server-error">{serverError}</div>}
      {successMessage && (
        <div className="form-server-success" role="status">
          ✓ {successMessage}
        </div>
      )}
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div
          className={`login-form__field ${hasVisibleError("email") ? "login-form__field--error" : ""}`}
        >
          <label className="login-form__label" htmlFor="login-email">
            Correo electrónico
          </label>
          <div className="login-form__input-wrapper">
            <input
              className={`login-form__input ${hasVisibleError("email") ? "login-form__input--error" : ""}`}
              id="login-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              aria-invalid={hasVisibleError("email")}
              aria-describedby={
                hasVisibleError("email") ? "login-email-error" : undefined
              }
            />
          </div>
          {hasVisibleError("email") && (
            <span
              className="form-field-error"
              id="login-email-error"
              role="alert"
            >
              {errors.email}
            </span>
          )}
        </div>

        {/* Contraseña */}
        <div
          className={`login-form__field ${hasVisibleError("password") ? "login-form__field--error" : ""}`}
        >
          <label className="login-form__label" htmlFor="login-password">
            Contraseña
          </label>
          <div className="login-form__input-wrapper">
            <input
              className={`login-form__input ${hasVisibleError("password") ? "login-form__input--error" : ""}`}
              id="login-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="•••••••"
              autoComplete="current-password"
              aria-invalid={hasVisibleError("password")}
              aria-describedby={
                hasVisibleError("password") ? "login-password-error" : undefined
              }
            />
          </div>
          {hasVisibleError("password") && (
            <span
              className="form-field-error"
              id="login-password-error"
              role="alert"
            >
              {errors.password}
            </span>
          )}
        </div>

        <button
          className="login-form__submit"
          type="submit"
          disabled={loading || hasAnyError()}
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
          Registrate
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
