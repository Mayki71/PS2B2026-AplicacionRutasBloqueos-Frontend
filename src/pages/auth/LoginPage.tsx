import { useNavigate } from 'react-router-dom';
import LoginForm from '../../modules/auth/components/form/LoginForm';
import '../../modules/auth/styles/login.css';
import { Navbar } from '../../modules/auth/components/landing';
import '../../modules/auth/styles/auth.css';
import { MapPin } from 'lucide-react';
const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="auth-layout">

        <div className="auth-switcher-top">
          <button
            className="auth-switcher-top__tab"
            type="button"
            onClick={() => navigate('/register')}
          >
            Registrarse
          </button>
          <button
            className="auth-switcher-top__tab auth-switcher-top__tab--active"
            type="button"
            disabled
          >
            Iniciar Sesion
          </button>
        </div>

        <div className="login-page">
          <div className="login-description">
            <div className="login-description__location">
              <MapPin size={16} color="#FCA311" />
              La Paz, Bolivia
            </div>

            <h1 className="login-description__heading">
              Bienvenido! Inicia Sesion con tus{' '}
              <span className="login-description__heading--accent">credenciales.</span>
            </h1>

            <p className="login-description__text">
              Accede a todas las funciones de PAZLY para reportar, visualizar y opinar sobre incidentes en tiempo real en La Paz.
            </p>

            <div className="login-description__metrics">
              <div className="login-description__metric">
                <div className="login-description__metric-value">+10k</div>
                <div className="login-description__metric-label">Usuarios Activos</div>
              </div>
              <div className="login-description__metric">
                <div className="login-description__metric-value">24/7</div>
                <div className="login-description__metric-label">Reportes en Vivo</div>
              </div>
            </div>
          </div>

          <LoginForm onSwitchToRegister={() => navigate('/register')} isActive={true} />
        </div>

      </div>
    </>
  );
};

export default LoginPage;