import React from "react";
import img from "../../../../assets/fondo_v2.webp";
import { useNavigate } from "react-router-dom";

const HeroSection = (): React.JSX.Element => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <>
      <section className="hero">
        <div className="hero__dashes">
          <span className="hero__dash hero__dash--1" />
          <span className="hero__dash hero__dash--2" />
          <span className="hero__dash hero__dash--3" />
          <span className="hero__dash hero__dash--4" />
          <span className="hero__dash hero__dash--5" />
          <span className="hero__dash hero__dash--6" />
        </div>
        <div className="hero__content">
          <h1 className="hero__title">Muevete sin sorpresas con PAZLY</h1>
          <p className="hero__subtitle">
            Nuestra aplicacion detecta incidentes en tiempo real y calcula rutas
            alternativas para que llegues sin contratiempos
          </p>
          <div className="hero__cta">
            <button
              className="btn-primary"
              onClick={() => navigate(isLoggedIn ? "/map" : "/register")}
            >
              Ver mapa
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate(isLoggedIn ? "/reportes" : "/login")}
            >
              Reportar un bloqueo
            </button>
          </div>
        </div>
        <div className="hero__image-placeholder">
          <img src={img} alt="Vista de la ciudad de La Paz" />
        </div>
      </section>
      <div className="stats-bar">
        <div className="stats-bar__item">
          <span className="stats-bar__number">136</span>
          <span className="stats-bar__label">
            Reportes esta
            <br />
            semana
          </span>
        </div>
        <div className="stats-bar__item">
          <span className="stats-bar__number">+300</span>
          <span className="stats-bar__label">
            Usuarios
            <br />
            activos
          </span>
        </div>
        <div className="stats-bar__item">
          <span className="stats-bar__number">20</span>
          <span className="stats-bar__label">
            Incidentes reportados
            <br />
            Hoy
          </span>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
