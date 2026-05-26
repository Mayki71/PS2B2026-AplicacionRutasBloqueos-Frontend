import { useNavigate } from "react-router-dom";
import RegisterForm from "../../modules/auth/components/form/RegisterForm";
import "../../modules/auth/styles/register.css";
import { Navbar } from "../../modules/auth/components/landing";
import '../../modules/auth/styles/auth.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="auth-layout">


        <div className="auth-switcher-top">
          <button
            className="auth-switcher-top__tab auth-switcher-top__tab--active"
            type="button"
            disabled
          >
            Registrarse
          </button>
          <button
            className="auth-switcher-top__tab"
            type="button"
            onClick={() => navigate('/login')}
          >
            Iniciar Sesion
          </button>
        </div>

        <div className="register-page">
          <RegisterForm
            onSwitchToLogin={() => navigate("/login")}
            isActive={true}
          />

          <div className="register-description">
            <div className="register-description__location">
              <svg
                className="register-description__location-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              La Paz, Bolivia
            </div>

            <h1 className="register-description__heading">
              Reporta lo que pasa en{" "}
              <span className="register-description__heading--accent">
                tu ciudad.
              </span>
            </h1>

            <p className="register-description__text">
              Unete a la comunidad de La Paz para reportar, visualizar y opinar
              sobre incidentes en tiempo real. Juntos hacemos una ciudad mas
              segura.
            </p>

            <div className="register-description__metrics">
              <div className="register-description__metric">
                <div className="register-description__metric-value">+10k</div>
                <div className="register-description__metric-label">
                  Usuarios Activos
                </div>
              </div>
              <div className="register-description__metric">
                <div className="register-description__metric-value">24/7</div>
                <div className="register-description__metric-label">
                  Reportes en Vivo
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default RegisterPage;