import React from "react";
import { useNavigate } from "react-router-dom";
import { useInstallPWA } from "../../hooks/useInstallPWA";

const WhyUs = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { isInstallable, installApp } = useInstallPWA();
  return (
    <>
      <section className="why-pazly">
        <h2 className="why-pazly__title">Por que PAZLY?</h2>
        <p className="why-pazly__text">
          Nuestra Ciudad de la Paz tiene una dinamica urbana que ninguna otra
          aplicacion entiende. Marchas, bloqueos, dinamitazos, y derrumbes en
          laderas son comunes en la Paz y estas afectan la movilidad de miles de
          personas. PAZLY nacio para darle a la comunidad pacena una herramienta
          disenada especificamente para su realidad, hecha desde y para la
          ciudad.
        </p>
      </section>
      <section className="cta-section">
        <div className="cta-section__bg" />
        <div className="cta-section__overlay" />
        <div className="cta-section__content">
          <h2 className="cta-section__title">Tu tiempo IMPORTA.</h2>
          <p className="cta-section__subtitle">
            Unete a la comunidad para llegar antes.
          </p>
          <div className="cta-section__actions">
            <button
              className="btn-cta-primary"
              onClick={() => navigate("/register")}
            >
              Registrate
            </button>
            <span className="cta-section__or">o</span>
            <button
              className="btn-cta-secondary"
              onClick={installApp}
              disabled={!isInstallable}
            >
              Descarga nuestra app
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default WhyUs;
