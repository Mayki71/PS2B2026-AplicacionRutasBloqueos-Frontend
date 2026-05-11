import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../modules/auth/services/authService";
import "../../modules/auth/styles/check-email.css";

const CheckEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // El email viene desde RegisterForm via navigate state
  const email = location.state?.email ?? "";
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setResendError(null);
    setResendSuccess(false);
    try {
      await authService.resendVerification(email);
      setResendSuccess(true);
    } catch (err: any) {
      setResendError(err.message || "Error al reenviar el email");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="check-email-page">
      <div className="check-email-card">
        <div className="check-email-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FCA311"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 7l10 7 10-7" />
          </svg>
        </div>

        <h1 className="check-email-title">Revisa tu correo</h1>
        <p className="check-email-subtitle">
          Enviamos un link de verificación a
        </p>
        {email && <span className="check-email-address">{email}</span>}
        <p className="check-email-hint">
          Haz click en el link del email para activar tu cuenta. Si no lo
          encuentras, revisa la carpeta de spam.
        </p>

        {resendSuccess && (
          <div className="check-email-success" role="status">
            Email reenviado correctamente
          </div>
        )}
        {resendError && (
          <div className="check-email-error" role="alert">
            {resendError}
          </div>
        )}

        <div className="check-email-actions">
          <button
            className="check-email-btn check-email-btn--primary"
            onClick={handleResend}
            disabled={resending || !email}
          >
            {resending ? "Reenviando..." : "Reenviar email"}
          </button>
          <button
            className="check-email-btn check-email-btn--secondary"
            onClick={() => navigate("/")}
          >
            Volver al inicio
          </button>
        </div>

        <p className="check-email-login">
          ¿Ya verificaste?{" "}
          <button
            className="check-email-link"
            onClick={() => navigate("/login")}
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
};

export default CheckEmailPage;
