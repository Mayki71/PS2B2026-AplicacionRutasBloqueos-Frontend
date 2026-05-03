import { LogIn, LogOut } from 'lucide-react';
import styles from './css/TopBar.module.css';

interface TopBarProps {
  onAction?: () => void;
  isLoggedIn?: boolean;
}

const TopBar = ({ onAction, isLoggedIn }: TopBarProps) => {
  return (
    <div className={styles.topBar}>
      <button className={styles.moreBtn} onClick={onAction} title={isLoggedIn ? "Cerrar Sesión" : "Iniciar Sesión"}>
        {isLoggedIn ? <LogOut size={20} /> : <LogIn size={20} />}
      </button>
    </div>
  );
};

export default TopBar;
