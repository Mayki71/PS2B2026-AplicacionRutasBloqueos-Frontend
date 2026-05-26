import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../modules/auth/styles/email-verified.css";
import { CircleCheck } from "lucide-react";
import { authService } from "../../modules/auth/services/authService";

const EmailVerifiedPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState(false);

  useEffect(() => {
    const init = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace("#", "?"));
      const accessToken = params.get("access_token");
      const errorParam = params.get("error");
      const errorDescription = params.get("error_description");

      if (errorParam || errorDescription) {
        setError(true);
        return;
      }

      if (accessToken) {
        localStorage.setItem("token", accessToken);
        try {
          const usuario = await authService.getMe();
          localStorage.setItem("usuario", JSON.stringify(usuario));
        } catch (err) {
          console.error("Error cargando usuario:", err);
        }
      }

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate("/map");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    };
    init();
  }, [navigate]);

  if (error) {
    return (
      <div className="email-verified-page">
        <div className="email-verified-card email-verified-card--error">
          <div className="email-verified-icon email-verified-icon--error">
            <CircleCheck size={32} color="#ef4444" />
          </div>
          <h1 className="email-verified-title">Link inválido o expirado</h1>
          <p className="email-verified-subtitle">
            El link de verificación expiró o ya fue usado. Solicita uno nuevo
            desde el login.
          </p>
          <button
            className="email-verified-btn"
            onClick={() => navigate("/login")}
          >
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="email-verified-page">
      <div className="email-verified-card">
        {/* Ícono de éxito */}
        <div className="email-verified-icon">
          <CircleCheck size={32} color="#ffffff" />
        </div>

        <h1 className="email-verified-title">¡Email verificado!</h1>
        <p className="email-verified-subtitle">
          Tu cuenta en Pazly está activa. Ya puedes iniciar sesión.
        </p>

        {/* Countdown */}
        <div className="email-verified-countdown">
          <span className="email-verified-countdown__number">{countdown}</span>
          <span className="email-verified-countdown__label">
            Redirigiendo al login...
          </span>
        </div>

        <button
          className="email-verified-btn"
          onClick={() => navigate("/login")}
        >
          Ir al login ahora
        </button>
      </div>
    </div>
  );
};

export default EmailVerifiedPage;
