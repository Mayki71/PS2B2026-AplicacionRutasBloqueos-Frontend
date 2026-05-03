import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

const Navbar = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initials, setInitials] = useState("");

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setIsLoggedIn(false);
    navigate("/");
  };
  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <div className="navbar__logo-icon">
          <MapPin size={20} color="#FCA311" />
        </div>
        Poner nombre xd
      </div>
      <ul className="navbar__nav">
        <li>
          <a href="#como-funciona">Mapa</a>
        </li>
        <li>
          <a href="#como-funciona">Como funciona</a>
        </li>
      </ul>

      <div className="navbar__actions">
        {isLoggedIn ? (
          <>
            <button
              className="navbar__avatar"
              onClick={() => navigate("/perfil")}
              title="Ver perfil"
            >
              {initials}
            </button>
          </>
        ) : (
          <>
            <button className="btn-ingresar" onClick={() => navigate("/login")}>
              Ingresar
            </button>
            <button className="btn-descargar">Descargar App</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
