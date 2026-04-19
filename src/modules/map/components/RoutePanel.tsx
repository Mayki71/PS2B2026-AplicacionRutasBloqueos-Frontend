import { useState, useRef } from 'react';
import { Search, ArrowUpDown, Menu, MapPin, Navigation, X, Clock, Route, ChevronRight } from 'lucide-react';
import styles from './RoutePanel.module.css';
import type { RouteInfo } from '../hooks/useMap';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.MAPBOX_TOKEN;

interface Suggestion {
  place_name: string;
  center: [number, number];
}

interface RoutePanelProps {
  onSearch?: (origin: string, destination: string) => void;
  routeInfo?: RouteInfo | null;
}

const formatDuration = (seconds: number) => {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs} h ${rem} min` : `${hrs} h`;
};

const formatDistance = (meters: number) => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

const formatArrival = (seconds: number) => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + seconds);
  return now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
};

const RoutePanel = ({ onSearch, routeInfo }: RoutePanelProps) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<Suggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<Suggestion[]>([]);
  const [focusedField, setFocusedField] = useState<'origin' | 'dest' | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'origin' | 'destination'>('origin');
  const originTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userCoordsRef = useRef<[number, number] | null>(null);

  const fetchSuggestions = async (query: string): Promise<Suggestion[]> => {
    if (!query || query.length < 2) return [];
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=BO&language=es&limit=5`
    );
    const data = await res.json();
    return data.features || [];
  };

  const handleOriginChange = (val: string) => {
    setOrigin(val);
    if (originTimer.current) clearTimeout(originTimer.current);
    originTimer.current = setTimeout(async () => {
      setOriginSuggestions(await fetchSuggestions(val));
    }, 300);
  };

  const handleDestChange = (val: string) => {
    setDestination(val);
    if (destTimer.current) clearTimeout(destTimer.current);
    destTimer.current = setTimeout(async () => {
      setDestSuggestions(await fetchSuggestions(val));
    }, 300);
  };

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
    setOriginSuggestions([]);
    setDestSuggestions([]);
  };

  const handleSearch = () => {
    if (onSearch && origin && destination) onSearch(origin, destination);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      userCoordsRef.current = [longitude, latitude];
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&language=es`
      )
        .then((r) => r.json())
        .then((data) => {
          const place = data.features?.[0]?.place_name || 'Mi ubicación';
          setOrigin(place);
          setOriginSuggestions([]);
        });
    }, () => {
      setOrigin('Mi ubicación');
    }, { enableHighAccuracy: true });
  };

  return (
    <>
      {/* Panel principal */}
      <div className={styles.panel}>
        <div className={styles.header}>
          <button className={styles.menuBtn} onClick={() => setMenuOpen(true)}>
            <Menu size={20} />
          </button>
          <h2 className={styles.title}>Instrucciones de ruta</h2>
        </div>

        <div className={styles.inputsWrapper}>
          {/* ORIGEN */}
          <div className={styles.inputRow}>
            <span className={styles.dotOrigin} />
            <div className={styles.inputBox}>
              <input
                type="text"
                placeholder="Elige el punto de partida"
                value={origin}
                onChange={(e) => handleOriginChange(e.target.value)}
                onFocus={() => setFocusedField('origin')}
                onBlur={() => setTimeout(() => setFocusedField(null), 200)}
                className={styles.input}
              />
              {origin && (
                <button className={styles.clearBtn} onMouseDown={() => { setOrigin(''); setOriginSuggestions([]); }}>
                  <X size={13} />
                </button>
              )}
              <Search size={15} className={styles.searchIcon} />
            </div>
          </div>

          {/* Sugerencias origen */}
          {focusedField === 'origin' && (
            <div className={styles.suggestions}>
              <button className={styles.suggestionItem} onMouseDown={useCurrentLocation}>
                <Navigation size={15} className={styles.suggestionIconBlue} />
                <span className={styles.suggestionText}>Mi ubicación actual</span>
              </button>
              {originSuggestions.map((s, i) => (
                <button key={i} className={styles.suggestionItem}
                  onMouseDown={() => { setOrigin(s.place_name); setOriginSuggestions([]); }}>
                  <MapPin size={15} className={styles.suggestionIconGray} />
                  <span className={styles.suggestionText}>{s.place_name}</span>
                </button>
              ))}
            </div>
          )}

          <div className={styles.divider} />

          {/* DESTINO */}
          <div className={styles.inputRow}>
            <span className={styles.dotDest} />
            <div className={styles.inputBox}>
              <input
                type="text"
                placeholder="Elige el destino"
                value={destination}
                onChange={(e) => handleDestChange(e.target.value)}
                onFocus={() => setFocusedField('dest')}
                onBlur={() => setTimeout(() => setFocusedField(null), 200)}
                className={styles.input}
              />
              {destination && (
                <button className={styles.clearBtn} onMouseDown={() => { setDestination(''); setDestSuggestions([]); }}>
                  <X size={13} />
                </button>
              )}
              <Search size={15} className={styles.searchIcon} />
            </div>
          </div>

          {/* Sugerencias destino */}
          {focusedField === 'dest' && destSuggestions.length > 0 && (
            <div className={styles.suggestions}>
              {destSuggestions.map((s, i) => (
                <button key={i} className={styles.suggestionItem}
                  onMouseDown={() => { setDestination(s.place_name); setDestSuggestions([]); }}>
                  <MapPin size={15} className={styles.suggestionIconGray} />
                  <span className={styles.suggestionText}>{s.place_name}</span>
                </button>
              ))}
            </div>
          )}

          <button className={styles.swapBtn} onClick={handleSwap} title="Intercambiar">
            <ArrowUpDown size={16} />
          </button>
        </div>

        {/* Resumen de ruta rápido */}
        {routeInfo && (
          <div className={styles.routeSummary}>
            <div className={styles.routeSummaryRow}>
              <Clock size={15} className={styles.routeIcon} />
              <span className={styles.routeDuration}>{formatDuration(routeInfo.duration)}</span>
              <span className={styles.routeArrival}>· Llegada a las {formatArrival(routeInfo.duration)}</span>
            </div>
            <div className={styles.routeSummaryRow}>
              <Route size={15} className={styles.routeIcon} />
              <span className={styles.routeDistance}>{formatDistance(routeInfo.distance)}</span>
            </div>
          </div>
        )}

        {origin && destination && (
          <button className={styles.searchBtn} onClick={handleSearch}>
            Buscar ruta
          </button>
        )}
      </div>

      {/* Drawer lateral estilo Google Maps */}
      {menuOpen && (
        <div className={styles.drawerOverlay} onClick={() => setMenuOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <button className={styles.drawerClose} onClick={() => setMenuOpen(false)}>
                <X size={20} />
              </button>
              <h3 className={styles.drawerTitle}>Información de ruta</h3>
            </div>

            {routeInfo ? (
              <>
                {/* Tiempo y distancia */}
                <div className={styles.drawerStats}>
                  <div className={styles.statCard}>
                    <Clock size={22} color="#f97316" />
                    <div>
                      <div className={styles.statValue}>{formatDuration(routeInfo.duration)}</div>
                      <div className={styles.statLabel}>Tiempo estimado</div>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <Route size={22} color="#f97316" />
                    <div>
                      <div className={styles.statValue}>{formatDistance(routeInfo.distance)}</div>
                      <div className={styles.statLabel}>Distancia</div>
                    </div>
                  </div>
                  <div className={styles.statCardFull}>
                    <div className={styles.statLabel}>Llegada estimada</div>
                    <div className={styles.statValueLarge}>{formatArrival(routeInfo.duration)}</div>
                  </div>
                </div>

                {/* Tabs origen / destino */}
                <div className={styles.tabs}>
                  <button className={`${styles.tab} ${activeTab === 'origin' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('origin')}>Punto de partida</button>
                  <button className={`${styles.tab} ${activeTab === 'destination' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('destination')}>Destino</button>
                </div>

                <div className={styles.placeInfo}>
                  {activeTab === 'origin' ? (
                    <>
                      <div className={styles.placeIcon}><MapPin size={20} color="#4a90e2" /></div>
                      <div className={styles.placeName}>{routeInfo.originName.split(',')[0]}</div>
                      <div className={styles.placeAddress}>{routeInfo.originName}</div>
                    </>
                  ) : (
                    <>
                      <div className={styles.placeIcon}><MapPin size={20} color="#e74c3c" /></div>
                      <div className={styles.placeName}>{routeInfo.destinationName.split(',')[0]}</div>
                      <div className={styles.placeAddress}>{routeInfo.destinationName}</div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.drawerEmpty}>
                <Route size={40} color="#ccc" />
                <p>Ingresa un punto de partida y un destino para ver la información de la ruta.</p>
              </div>
            )}

            <div className={styles.drawerMenu}>
              <button className={styles.drawerMenuItem}>
                <span>Reportar bloqueo</span>
                <ChevronRight size={16} />
              </button>
              <button className={styles.drawerMenuItem}>
                <span>Configuración</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoutePanel;