import React from 'react';
import { FiFacebook, FiInstagram, FiTwitter, FiGithub
 } from 'react-icons/fi';

 
const Footer = (): React.JSX.Element => {
   return (
    <footer className="footer">
      <div className="footer__content">

        <div className="footer__section">
          <h3 className="footer__brand">App</h3>
          <p className="footer__tagline">
            La aplicación de movilidad urbana diseñada para La Paz, Bolivia.
            Reporta, verifica y elude bloqueos en tiempo real.
          </p>
        </div>

        <div className="footer__section">
          <h4 className="footer__title">Enlaces</h4>
          <nav className="footer__nav">
            <a href="#inicio">Inicio</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#por-que">Por qué Nosotros</a>
            <a href="#descargar">Descargar App</a>
          </nav>
        </div>

        <div className="footer__section">
          <h4 className="footer__title">Conecta</h4>
          <div className="footer__socials">
            <a href="https://instagram.com" className="footer__social-link" aria-label="Instagram">
              <FiInstagram size={18} />
            </a>
            <a href="https://twitter.com" className="footer__social-link" aria-label="X (Twitter)">
              <FiTwitter size={18} />
            </a>
            <a href="https://facebook.com" className="footer__social-link" aria-label="Facebook">
              <FiFacebook size={18} />
            </a>
            <a href="https://github.com" className="footer__social-link" aria-label="GitHub">
              <FiGithub size={18} />
            </a>
          </div>
          <p className="footer__contact">
            Contacto: <a href="mailto:suchasoft@gmail.com">suchasoft@gmail.com</a>
          </p>
        </div>
      </div>

      <div className="footer__divider">
        <p className="footer__copyright">
          © 2025 App - Hecho por suchas para suchas - SuchaSoft. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;