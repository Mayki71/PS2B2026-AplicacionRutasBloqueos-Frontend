import { useNavigate } from 'react-router-dom';
import MapView from '../../modules/map/components/MapView';
import RoutePanel from '../../modules/map/components/RoutePanel';
import TopBar from '../../modules/map/components/TopBar';
import { useMap } from '../../modules/map/hooks/useMap';
import styles from './MapPage.module.css';

const MapPage = () => {
  const navigate = useNavigate();
  const { handleMapLoad, searchRoute } = useMap();

  return (
    <div className={styles.container}>
      <TopBar onLogin={() => navigate('/auth/login')} />
      <div className={styles.mapWrapper}>
        <MapView onMapLoad={handleMapLoad} />
        <RoutePanel onSearch={searchRoute} />
      </div>
    </div>
  );
};

export default MapPage;