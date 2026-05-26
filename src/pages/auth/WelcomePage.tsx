import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../modules/auth/styles/welcome.css";
import { ArrowRight, Bell, MapPin, Users } from "lucide-react";
const WelcomePage = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`welcome-page ${visible ? "welcome-page--visible" : ""}`}>
      <div className="welcome-bg">
        <div className="welcome-bg__grid" />
        <div className="welcome-bg__glow" />
        <div className="welcome-bg__orb welcome-bg__orb--1" />
        <div className="welcome-bg__orb welcome-bg__orb--2" />
        <div className="welcome-bg__orb welcome-bg__orb--3" />

        {[
          { size: 8, top: "20%", left: "15%", dur: "7s", dly: "0s" },
          { size: 5, top: "65%", left: "78%", dur: "9s", dly: "1s" },
          { size: 10, top: "80%", left: "25%", dur: "6s", dly: "2s" },
          { size: 6, top: "35%", left: "88%", dur: "8s", dly: "0.5s" },
          { size: 7, top: "50%", left: "5%", dur: "10s", dly: "3s" },
        ].map((p, i) => (
          <div
            key={i}
            className="welcome-particle"
            style={{
              width: p.size,
              height: p.size,
              top: p.top,
              left: p.left,
              ["--dur" as string]: p.dur,
              ["--dly" as string]: p.dly,
            }}
          />
        ))}
      </div>

      <div className="welcome-content">
        <div className="welcome-logo">
          <div className="welcome-logo__icon">
            <MapPin height={24} width={24} color="orange" />
          </div>
          <span className="welcome-logo__text">Nombre App</span>
        </div>

        <div className="welcome-hero">
          <h1 className="welcome-hero__title">
            Navega en La Paz
            <br />
            <span className="welcome-hero__title--accent">sin sorpresas</span>
          </h1>
          <p className="welcome-hero__subtitle">
            Reportes de bloqueos en tiempo real, de paceños para paceños.
          </p>
        </div>

        <div className="welcome-features">
          <div className="welcome-feature-chip">
            <span className="welcome-feature-chip__icon">
              <MapPin height={20} width={20} />
            </span>
            GPS en tiempo real
          </div>
          <div className="welcome-feature-chip">
            <span className="welcome-feature-chip__icon">
              <Users height={20} width={20} />
            </span>
            Sistema Colaborativo
          </div>
          <div className="welcome-feature-chip">
            <span className="welcome-feature-chip__icon">
              <Bell height={20} width={20} />
            </span>
            Alertas de Incidentes Viales
          </div>
        </div>

        <div className="welcome-actions">
          <button
            className="welcome-btn welcome-btn--primary"
            onClick={() => navigate("/register")}
          >
            Crear cuenta gratis
            <ArrowRight height={18} width={18} style={{ marginLeft: 8 }} />
          </button>

          <button
            className="welcome-btn welcome-btn--secondary"
            onClick={() => navigate("/login")}
          >
            Ya tengo cuenta
          </button>
        </div>

        <p className="welcome-footer">
          Hecho en La Paz - Bolivia · Univalle - SuchaSoft 2026
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;
