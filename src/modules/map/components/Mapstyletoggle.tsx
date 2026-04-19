import styles from './MapStyleToggle.module.css';

interface MapStyleToggleProps {
  currentStyle: 'standard' | 'satellite';
  onToggle: () => void;
}

const MapStyleToggle = ({ currentStyle, onToggle }: MapStyleToggleProps) => {
  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.option} ${currentStyle === 'standard' ? styles.active : ''}`}
        onClick={() => currentStyle !== 'standard' && onToggle()}
        title="Vista estándar"
      >
        <div className={styles.preview}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="6" fill="#e8f4ea"/>
            <rect x="4" y="10" width="28" height="3" rx="1" fill="#94c97a"/>
            <rect x="4" y="18" width="20" height="3" rx="1" fill="#94c97a"/>
            <rect x="4" y="26" width="24" height="3" rx="1" fill="#94c97a"/>
            <rect x="0" y="14" width="36" height="2" rx="1" fill="#ccc"/>
            <rect x="0" y="22" width="36" height="2" rx="1" fill="#ccc"/>
          </svg>
        </div>
        <span>Estándar</span>
      </button>

      <button
        className={`${styles.option} ${currentStyle === 'satellite' ? styles.active : ''}`}
        onClick={() => currentStyle !== 'satellite' && onToggle()}
        title="Vista satelital"
      >
        <div className={styles.preview}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="6" fill="#2d4a2d"/>
            <circle cx="10" cy="12" r="5" fill="#3a6b3a"/>
            <circle cx="22" cy="8" r="4" fill="#4a7a4a"/>
            <circle cx="28" cy="20" r="6" fill="#355935"/>
            <rect x="4" y="28" width="10" height="4" rx="1" fill="#8a7a5a"/>
            <rect x="18" y="26" width="14" height="4" rx="1" fill="#7a6a4a"/>
          </svg>
        </div>
        <span>Satélite</span>
      </button>
    </div>
  );
};

export default MapStyleToggle;