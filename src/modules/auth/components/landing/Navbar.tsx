import { MapPin, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

const Navbar = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initials, setInitials] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuario = localStorage.getItem("usuario");
    if (token && usuario) {
      setIsLoggedIn(true);
      const u = JSON.parse(usuario);
      const n = u.nombre?.[0] ?? "";
      const a = u.apellido_paterno?.[0] ?? "";
      setInitials((n + a).toUpperCase());
    }
  }, []);

  const goTo = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".navbar")) setMenuOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  return (
    <nav className="navbar">
      <div
        className="navbar__logo"
        onClick={() => goTo("/")}
        style={{ cursor: "pointer" }}
      >
        <div className="navbar__logo-icon">
          <MapPin size={20} color="#FCA311" />
        </div>
        Poner nombre  
      </div>

      <ul className="navbar__nav">
        <li>
          <a href="#como-funciona">Mapa</a>
        </li>
        <li>
          <a href="#como-funciona">Cómo funciona</a>
        </li>
      </ul>

      <div className="navbar__actions">
        {isLoggedIn ? (
          <button
            className="navbar__avatar"
            onClick={() => goTo("/perfil")}
            title="Ver perfil"
          >
            {initials}
          </button>
        ) : (
          <>
            <button className="btn-ingresar" onClick={() => goTo("/login")}>
              Ingresar
            </button>
            <button className="btn-descargar">Descargar App</button>
          </>
        )}
      </div>

      <button
        className="navbar__hamburger"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Menú"
        aria-expanded={menuOpen}
      >
        {menuOpen ? (
          <X size={22} color="#fff" />
        ) : (
          <Menu size={22} color="#fff" />
        )}
      </button>


      <div
        className={`navbar__mobile-menu ${menuOpen ? "navbar__mobile-menu--open" : ""}`}
      >
        <ul className="navbar__mobile-nav">
          <li>
            <a href="#como-funciona" onClick={() => setMenuOpen(false)}>
              Mapa
            </a>
          </li>
          <li>
            <a href="#como-funciona" onClick={() => setMenuOpen(false)}>
              Cómo funciona
            </a>
          </li>
        </ul>
        <div className="navbar__mobile-actions">
          {isLoggedIn ? (
            <button
              className="navbar__mobile-btn navbar__mobile-btn--primary"
              onClick={() => goTo("/perfil")}
            >
              Mi perfil ({initials})
            </button>
          ) : (
            <>
              <button
                className="navbar__mobile-btn navbar__mobile-btn--primary"
                onClick={() => goTo("/login")}
              >
                Ingresar
              </button>
              <button className="navbar__mobile-btn navbar__mobile-btn--secondary">
                Descargar App
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
