import { useNavigate } from 'react-router-dom';
import MapView from '../../modules/map/components/MapView';
import RoutePanel from '../../modules/map/components/RoutePanel';
import TopBar from '../../modules/map/components/TopBar';
import MapStyleToggle from '../../modules/map/components/MapStyleToggle';
import MapContextMenu from '../../modules/map/components/MapContextMenu';
import { useMap } from '../../modules/map/hooks/useMap';
import { useUI } from '../../components/UIProvider';
import styles from './MapPage.module.css';

interface MapPageProps {
  onReportHere?: (lat: number, lng: number, direccion?: string) => void;
  reportMode?: boolean;
  onMarkPoints?: (a: [number, number] | null, b: [number, number] | null) => void;
  /** Callback con la instancia del mapa una vez que carga */
  onMapReady?: (map: mapboxgl.Map) => void;
  /** Bloqueos activos para calcular rutas alternativas */
  reportes?: any[];
}

const MapPage = ({ onReportHere, reportMode, onMarkPoints, onMapReady, reportes }: MapPageProps) => {
  const navigate = useNavigate();
  const { showToast } = useUI();
  const {
    handleMapLoad, searchRoute, routeInfo,
    mapStyle, toggleMapStyle, clearRoute,
    contextMenu, closeContextMenu,
    onSetOriginRef, onSetDestRef,
    showOriginPreview, showDestPreview,
  } = useMap();

  const handleSetOrigin = (name: string, coords: [number, number]) => {
    if (onSetOriginRef.current) onSetOriginRef.current(name, coords);
    // Mostrar marcador A inmediatamente al elegir origen desde el menú contextual
    showOriginPreview(coords);
  };
  const handleSetDest = (name: string, coords: [number, number]) => {
    if (onSetDestRef.current) onSetDestRef.current(name, coords);
    // Mostrar marcador B inmediatamente al elegir destino desde el menú contextual
    showDestPreview(coords);
  };
  const handleCenter = (coords: [number, number]) => {
    window.dispatchEvent(new CustomEvent('map:flyto', { detail: coords }));
  };
  const handleShare = (coords: [number, number]) => {
    const url = `https://www.google.com/maps?q=${coords[1]},${coords[0]}`;
    navigator.clipboard?.writeText(url)
      .then(() => showToast('Enlace copiado al portapapeles', 'success'))
      .catch(() => window.open(url, '_blank'));
  };

  const isLoggedIn = !!localStorage.getItem('token');

  const handleAuthAction = () => {
    if (isLoggedIn) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      showToast('Sesión cerrada correctamente', 'success');
      navigate('/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className={styles.container}>
      <MapView
        onMapLoad={handleMapLoad}
        onMapReady={onMapReady}
        mapStyle={mapStyle}
        reportMode={reportMode}
        onMarkPoints={onMarkPoints}
      />
      <RoutePanel
        onSearch={(origin, destination, originCoords, destCoords) =>
          searchRoute(origin, destination, originCoords, destCoords, reportes)
        }
        onClear={clearRoute}
        routeInfo={routeInfo}
        onSetOriginRef={onSetOriginRef}
        onSetDestRef={onSetDestRef}
        onOriginPreview={showOriginPreview}
        onDestPreview={showDestPreview}
      />
      <TopBar onAction={handleAuthAction} isLoggedIn={isLoggedIn} />
      <MapStyleToggle currentStyle={mapStyle} onToggle={toggleMapStyle} />
      <MapContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        placeName={contextMenu.placeName}
        lngLat={contextMenu.lngLat}
        onClose={closeContextMenu}
        onSetOrigin={handleSetOrigin}
        onSetDest={handleSetDest}
        onCenter={handleCenter}
        onShare={handleShare}
        onReportHere={onReportHere}
      />
    </div>
  );
};

export default MapPage;