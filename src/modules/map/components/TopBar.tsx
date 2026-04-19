import { MoreVertical } from 'lucide-react';
import styles from './TopBar.module.css';

interface TopBarProps {
  onLogin?: () => void;
}

const TopBar = ({ onLogin }: TopBarProps) => {
  return (
    <div className={styles.topBar}>
      <button className={styles.moreBtn}>
        <MoreVertical size={20} />
      </button>
      <button className={styles.loginBtn} onClick={onLogin}>
        Iniciar Sesión
      </button>
    </div>
  );
};

export default TopBar;