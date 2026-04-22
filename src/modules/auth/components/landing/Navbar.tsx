import { MapPin } from "lucide-react";
import React from "react";

const Navbar = (): React.JSX.Element => {
    return (
    <nav className="navbar">
      <div className="navbar__logo">
        <div className="navbar__logo-icon">
          <MapPin size={20} color="#FCA311" />
        </div>
        Poner nombre xd
      </div>
      <ul className="navbar__nav">
        <li><a href="#como-funciona">Mapa</a></li>
        <li><a href="#como-funciona">Como funciona</a></li>
      </ul>
      <div className="navbar__actions">
        <button className="btn-ingresar">Ingresar</button>
        <button className="btn-descargar">Descargar App</button>
      </div>
    </nav>
  );
}

export default Navbar;