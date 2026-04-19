import { useNavigate } from 'react-router-dom';
import MapView from '../../modules/map/components/MapView';
import RoutePanel from '../../modules/map/components/RoutePanel';
import TopBar from '../../modules/map/components/TopBar';
import MapStyleToggle from '../../modules/map/components/MapStyleToggle';
import { useMap } from '../../modules/map/hooks/useMap';
import styles from './MapPage.module.css';

const MapPage = () => {
  const navigate = useNavigate();
  const { handleMapLoad, searchRoute, routeInfo, mapStyle, toggleMapStyle } = useMap();

  return (
    <div className={styles.container}>
      <MapView onMapLoad={handleMapLoad} mapStyle={mapStyle} />
      <RoutePanel onSearch={searchRoute} routeInfo={routeInfo} />
      <TopBar onLogin={() => navigate('/auth/login')} />
      <MapStyleToggle currentStyle={mapStyle} onToggle={toggleMapStyle} />
    </div>
  );
};

export default MapPage;