import { useState, useRef, useEffect } from 'react';
import { Search, ArrowUpDown, Menu, MapPin, Navigation, X, Clock, Route, ChevronRight, Trash2 } from 'lucide-react';
import styles from './css/RoutePanel.module.css';
import type { RouteInfo } from '../hooks/useMap';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.MAPBOX_TOKEN;

interface Suggestion {
  place_name: string;
  center: [number, number];
}

interface RoutePanelProps {
  onSearch?: (origin: string, destination: string, originCoords?: [number, number], destCoords?: [number, number]) => void;
  onClear?: () => void;
  routeInfo?: RouteInfo | null;
  onSetOriginRef?: React.MutableRefObject<((name: string, coords: [number, number]) => void) | null>;
  onSetDestRef?: React.MutableRefObject<((name: string, coords: [number, number]) => void) | null>;
}

const formatDuration = (s: number) => {
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r > 0 ? `${h} h ${r} min` : `${h} h`;
};
const formatDistance = (m: number) => m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
const formatArrival = (s: number) => {
  const d = new Date();
  d.setSeconds(d.getSeconds() + s);
  return d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
};

const RoutePanel = ({ onSearch, onClear, routeInfo, onSetOriginRef, onSetDestRef }: RoutePanelProps) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState<[number, number] | undefined>();
  const [destCoords, setDestCoords] = useState<[number, number] | undefined>();
  const [originSuggestions, setOriginSuggestions] = useState<Suggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<Suggestion[]>([]);
  const [focusedField, setFocusedField] = useState<'origin' | 'dest' | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'origin' | 'destination'>('origin');
  const originTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Exponer setters para el context menu del mapa
  useEffect(() => {
    if (onSetOriginRef) {
      onSetOriginRef.current = (name: string, coords: [number, number]) => {
        setOrigin(name);
        setOriginCoords(coords);
        setOriginSuggestions([]);
      };
    }
    if (onSetDestRef) {
      onSetDestRef.current = (name: string, coords: [number, number]) => {
        setDestination(name);
        setDestCoords(coords);
        setDestSuggestions([]);
      };
    }
  }, [onSetOriginRef, onSetDestRef]);

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
    setOriginCoords(undefined);
    if (originTimer.current) clearTimeout(originTimer.current);
    originTimer.current = setTimeout(async () => {
      setOriginSuggestions(await fetchSuggestions(val));
    }, 300);
  };

  const handleDestChange = (val: string) => {
    setDestination(val);
    setDestCoords(undefined);
    if (destTimer.current) clearTimeout(destTimer.current);
    destTimer.current = setTimeout(async () => {
      setDestSuggestions(await fetchSuggestions(val));
    }, 300);
  };

  const handleSwap = () => {
    setOrigin(destination); setDestination(origin);
    setOriginCoords(destCoords); setDestCoords(originCoords);
    setOriginSuggestions([]); setDestSuggestions([]);
  };

  const handleClearAll = () => {
    setOrigin(''); setDestination('');
    setOriginCoords(undefined); setDestCoords(undefined);
    setOriginSuggestions([]); setDestSuggestions([]);
    if (onClear) onClear();
  };

  const handleSearch = () => {
    if (onSearch && origin && destination)
      onSearch(origin, destination, originCoords, destCoords);
  };

  // Ubicación actual con coordenadas exactas → pasa coords al hook
  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const coords: [number, number] = [lng, lat];
        setOriginCoords(coords);
        // Label con coordenadas, no texto de calle
        setOrigin(`Mi ubicación (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
        setOriginSuggestions([]);
      },
      () => alert('No se pudo obtener tu ubicación.'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
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
          {(origin || destination || routeInfo) && (
            <button className={styles.clearAllBtn} onClick={handleClearAll} title="Limpiar todo">
              <Trash2 size={16} />
            </button>
          )}
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
                <button className={styles.clearBtn} onMouseDown={() => { setOrigin(''); setOriginCoords(undefined); setOriginSuggestions([]); }}>
                  <X size={13} />
                </button>
              )}
              <Search size={15} className={styles.searchIcon} />
            </div>
          </div>

          {focusedField === 'origin' && (
            <div className={styles.suggestions}>
              <button className={styles.suggestionItem} onMouseDown={useCurrentLocation}>
                <Navigation size={15} className={styles.suggestionIconBlue} />
                <span className={styles.suggestionText}>Mi ubicación actual (GPS exacto)</span>
              </button>
              {originSuggestions.map((s, i) => (
                <button key={i} className={styles.suggestionItem}
                  onMouseDown={() => { setOrigin(s.place_name); setOriginCoords(s.center); setOriginSuggestions([]); }}>
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
                <button className={styles.clearBtn} onMouseDown={() => { setDestination(''); setDestCoords(undefined); setDestSuggestions([]); }}>
                  <X size={13} />
                </button>
              )}
              <Search size={15} className={styles.searchIcon} />
            </div>
          </div>

          {focusedField === 'dest' && destSuggestions.length > 0 && (
            <div className={styles.suggestions}>
              {destSuggestions.map((s, i) => (
                <button key={i} className={styles.suggestionItem}
                  onMouseDown={() => { setDestination(s.place_name); setDestCoords(s.center); setDestSuggestions([]); }}>
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
          <button className={styles.searchBtn} onClick={handleSearch}>Buscar ruta</button>
        )}
      </div>

      {/* Drawer lateral */}
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

                <div className={styles.tabs}>
                  <button className={`${styles.tab} ${activeTab === 'origin' ? styles.tabActive : ''}`} onClick={() => setActiveTab('origin')}>Punto de partida</button>
                  <button className={`${styles.tab} ${activeTab === 'destination' ? styles.tabActive : ''}`} onClick={() => setActiveTab('destination')}>Destino</button>
                </div>

                <div className={styles.placeInfo}>
                  {activeTab === 'origin' ? (
                    <>
                      <div className={styles.placeIcon}><MapPin size={20} color="#4a90e2" /></div>
                      <div className={styles.placeName}>{routeInfo.originName.split(',')[0]}</div>
                      <div className={styles.placeAddress}>{routeInfo.originName}</div>
                      <div className={styles.placeCoords}>
                        📍 {routeInfo.originCoords[1].toFixed(6)}, {routeInfo.originCoords[0].toFixed(6)}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.placeIcon}><MapPin size={20} color="#e74c3c" /></div>
                      <div className={styles.placeName}>{routeInfo.destinationName.split(',')[0]}</div>
                      <div className={styles.placeAddress}>{routeInfo.destinationName}</div>
                      <div className={styles.placeCoords}>
                        📍 {routeInfo.destinationCoords[1].toFixed(6)}, {routeInfo.destinationCoords[0].toFixed(6)}
                      </div>
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
                <span>Reportar bloqueo</span><ChevronRight size={16} />
              </button>
              <button className={styles.drawerMenuItem}>
                <span>Configuración</span><ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoutePanel;