import { Share2, Crosshair, MapPin, Navigation } from 'lucide-react';
import styles from './css/MapContextMenu.module.css';

interface MapContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  placeName: string;
  lngLat: [number, number] | null;
  onClose: () => void;
  onSetOrigin: (name: string, coords: [number, number]) => void;
  onSetDest: (name: string, coords: [number, number]) => void;
  onCenter: (coords: [number, number]) => void;
  onShare: (coords: [number, number]) => void;
}

const MapContextMenu = ({
  visible, x, y, placeName, lngLat,
  onClose, onSetOrigin, onSetDest, onCenter, onShare
}: MapContextMenuProps) => {
  if (!visible || !lngLat) return null;

  const label = placeName.split(',')[0] || `${lngLat[1].toFixed(5)}, ${lngLat[0].toFixed(5)}`;
  const coordLabel = `${lngLat[1].toFixed(6)}, ${lngLat[0].toFixed(6)}`;

  // Ajustar posición para que no se salga de la pantalla
  const menuW = 240;
  const menuH = 200;
  const adjX = x + menuW > window.innerWidth ? x - menuW : x;
  const adjY = y + menuH > window.innerHeight ? y - menuH : y;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.menu}
        style={{ left: adjX, top: adjY }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.menuHeader}>
          <MapPin size={14} color="#e74c3c" />
          <div>
            <div className={styles.menuTitle}>{label}</div>
            <div className={styles.menuCoords}>{coordLabel}</div>
          </div>
        </div>
        <div className={styles.menuDivider} />
        <button className={styles.menuItem} onClick={() => { onShare(lngLat); onClose(); }}>
          <Share2 size={15} /><span>Compartir</span>
        </button>
        <button className={styles.menuItem} onClick={() => { onCenter(lngLat); onClose(); }}>
          <Crosshair size={15} /><span>Poner como centro del mapa</span>
        </button>
        <button className={styles.menuItem} onClick={() => { onSetOrigin(coordLabel, lngLat); onClose(); }}>
          <Navigation size={15} color="#4a90e2" /><span>Establecer como punto de partida</span>
        </button>
        <button className={styles.menuItem} onClick={() => { onSetDest(coordLabel, lngLat); onClose(); }}>
          <MapPin size={15} color="#e74c3c" /><span>Establecer como destino</span>
        </button>
      </div>
    </div>
  );
};

export default MapContextMenu;