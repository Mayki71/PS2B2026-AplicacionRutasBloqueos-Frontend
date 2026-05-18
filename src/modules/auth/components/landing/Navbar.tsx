import { MapPin } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = (): React.JSX.Element => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div 
        className="navbar__logo" 
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
      >
        <div className="navbar__logo-icon">
          <MapPin size={20} color="#FCA311" />
        </div>
        PAZLY
      </div>
      <ul className="navbar__nav">
        <li><a href="#como-funciona">Mapa</a></li>
        <li><a href="#como-funciona">Como funciona</a></li>
      </ul>
      <div className="navbar__actions">
        <button className="btn-ingresar" onClick={() => navigate('/login')}>Ingresar</button>
        <button className="btn-descargar">Descargar App</button>
      </div>
    </nav>
  );
}

export default Navbar;
