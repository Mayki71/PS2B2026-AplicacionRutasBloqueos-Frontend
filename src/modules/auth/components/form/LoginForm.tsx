import { useState, FormEvent, ChangeEvent } from "react";
import "../../styles/login.css";
import { authService } from "../../services/authService";

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
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await authService.login({
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem("token", result.token);
      localStorage.setItem("usuario", JSON.stringify(result.usuario));
      console.log("Login exitoso:", result);
      // aquí después redirigís al mapa
    } catch (err: any) {
      setError(err.message || "Email o contraseña incorrectos");
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

       <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="login-form__field">
          <label className="login-form__label" htmlFor="login-email">
            Correo electrónico
          </label>
          <div className="login-form__input-wrapper">
            <input className="login-form__input" id="login-email" type="email"
              name="email" value={formData.email} onChange={handleChange}
              placeholder="correo@ejemplo.com" autoComplete="email" />
          </div>
        </div>

        <div className="login-form__field">
          <label className="login-form__label" htmlFor="login-password">
            Contraseña
          </label>
          <div className="login-form__input-wrapper">
            <input className="login-form__input" id="login-password" type="password"
              name="password" value={formData.password} onChange={handleChange}
              placeholder="•••••••" autoComplete="current-password" />
          </div>
        </div>

        <button className="login-form__submit" type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>

      <p className="login-form__switch-text">
        No tienes una cuenta?{" "}
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
