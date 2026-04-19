import { MoreVertical } from 'lucide-react';
import styles from './TopBar.module.css';

interface TopBarProps {
  onLogin?: () => void;
}

const TopBar = ({ onLogin }: TopBarProps) => {
  return (
    <div className={styles.topBar}>
      <span className={styles.title}>Vista Mapa</span>
      <div className={styles.actions}>
        <button className={styles.moreBtn}>
          <MoreVertical size={20} />
        </button>
        <button className={styles.loginBtn} onClick={onLogin}>
          Iniciar Sesion
        </button>
      </div>
    </div>
  );
};

export default TopBar;