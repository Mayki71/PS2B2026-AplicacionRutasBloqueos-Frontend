import { useNavigate } from 'react-router-dom';
import MapView from '../../modules/map/components/MapView';
import RoutePanel from '../../modules/map/components/RoutePanel';
import TopBar from '../../modules/map/components/TopBar';
import MapStyleToggle from '../../modules/map/components/MapStyleToggle';
import MapContextMenu from '../../modules/map/components/MapContextMenu';
import { useMap } from '../../modules/map/hooks/useMap';
import styles from './MapPage.module.css';

const MapPage = () => {
  const navigate = useNavigate();
  const {
    handleMapLoad, searchRoute, routeInfo,
    mapStyle, toggleMapStyle, clearRoute,
    contextMenu, closeContextMenu,
    onSetOriginRef, onSetDestRef,
  } = useMap();

  const handleSetOrigin = (name: string, coords: [number, number]) => {
    if (onSetOriginRef.current) onSetOriginRef.current(name, coords);
  };

  const handleSetDest = (name: string, coords: [number, number]) => {
    if (onSetDestRef.current) onSetDestRef.current(name, coords);
  };

  const handleCenter = (coords: [number, number]) => {
    // El mapa se centra — accedemos via ref indirectamente a través de handleMapLoad
    // Para simplificar usamos el evento de contextmenu que ya tiene el mapa
    window.dispatchEvent(new CustomEvent('map:flyto', { detail: coords }));
  };

  const handleShare = (coords: [number, number]) => {
    const url = `https://www.google.com/maps?q=${coords[1]},${coords[0]}`;
    navigator.clipboard?.writeText(url).then(() => alert('Enlace copiado al portapapeles')).catch(() => {
      window.open(url, '_blank');
    });
  };

  return (
    <div className={styles.container}>
      <MapView onMapLoad={handleMapLoad} mapStyle={mapStyle} />
      <RoutePanel
        onSearch={searchRoute}
        onClear={clearRoute}
        routeInfo={routeInfo}
        onSetOriginRef={onSetOriginRef}
        onSetDestRef={onSetDestRef}
      />
      <TopBar onLogin={() => navigate('/auth/login')} />
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
      />
    </div>
  );
};

export default MapPage;