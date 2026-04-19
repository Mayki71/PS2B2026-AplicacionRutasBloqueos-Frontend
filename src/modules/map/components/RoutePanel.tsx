import { useState } from 'react';
import { Search, ArrowUpDown, Menu } from 'lucide-react';
import styles from './RoutePanel.module.css';

interface RoutePanelProps {
  onSearch?: (origin: string, destination: string) => void;
}

const RoutePanel = ({ onSearch }: RoutePanelProps) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSearch = () => {
    if (onSearch) onSearch(origin, destination);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <button className={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
          <Menu size={20} />
        </button>
        <h2 className={styles.title}>Instrucciones de ruta</h2>
      </div>

      <div className={styles.inputsWrapper}>
        <div className={styles.inputRow}>
          <span className={styles.dotOrigin} />
          <div className={styles.inputBox}>
            <input
              type="text"
              placeholder="Elige el punto de partida"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className={styles.input}
            />
            <Search size={16} className={styles.searchIcon} />
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.inputRow}>
          <span className={styles.dotDest} />
          <div className={styles.inputBox}>
            <input
              type="text"
              placeholder="Elige el destino"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className={styles.input}
            />
            <Search size={16} className={styles.searchIcon} />
          </div>
        </div>

        <button className={styles.swapBtn} onClick={handleSwap} title="Intercambiar">
          <ArrowUpDown size={16} />
        </button>
      </div>

      {origin && destination && (
        <button className={styles.searchBtn} onClick={handleSearch}>
          Buscar ruta
        </button>
      )}
    </div>
  );
};

export default RoutePanel;