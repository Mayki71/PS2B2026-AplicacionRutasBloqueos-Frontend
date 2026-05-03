import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUI } from '../../../components/UIProvider';
import { Search, ArrowUpDown, Menu, MapPin, Navigation, X, Clock, Route, ChevronRight, Trash2, Utensils, Hospital, Landmark, GraduationCap, Fuel, Coffee, TreePine, Pill } from 'lucide-react';
import styles from './css/RoutePanel.module.css';
import type { RouteInfo } from '../hooks/useMap';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.MAPBOX_TOKEN;

interface Suggestion {
  place_name: string;
  center: [number, number];
  text: string;
  properties?: {
    category?: string;
    maki?: string;
    address?: string;
  };
  context?: Array<{ id: string; text: string }>;
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
  const [activeTab, setActiveTab] = useState<'origin' | 'destination' | 'lugar'>('origin');
  const [selectedPlace, setSelectedPlace] = useState<Suggestion | null>(null);
  const originTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { showToast } = useUI();

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
        setOrigin(`Mi ubicación (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
        setOriginSuggestions([]);
      },
      () => showToast('No se pudo obtener tu ubicación. Verifica los permisos del navegador.', 'warning'),
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
                  onMouseDown={() => {
                    setOrigin(s.place_name);
                    setOriginCoords(s.center);
                    setOriginSuggestions([]);
                    setSelectedPlace(s);
                  }}>
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
                  onMouseDown={() => {
                    setDestination(s.place_name);
                    setDestCoords(s.center);
                    setDestSuggestions([]);
                    setSelectedPlace(s);
                  }}>
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
      {menuOpen && createPortal(
        <div className={styles.drawerOverlay} onClick={() => setMenuOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <button className={styles.drawerClose} onClick={() => setMenuOpen(false)}>
                <X size={20} />
              </button>
              <h3 className={styles.drawerTitle}>Menú</h3>
            </div>

            {routeInfo ? (
              <>
                <div className={styles.drawerStats}>
                  <div className={styles.statCard}>
                    <Clock size={22} color="#FCA311" />
                    <div>
                      <div className={styles.statValue}>{formatDuration(routeInfo.duration)}</div>
                      <div className={styles.statLabel}>Tiempo estimado</div>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <Route size={22} color="#FCA311" />
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
                  <button
                    className={`${styles.tab} ${activeTab === 'origin' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('origin')}
                  >Partida</button>
                  <button
                    className={`${styles.tab} ${activeTab === 'destination' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('destination')}
                  >Destino</button>
                  {selectedPlace && (
                    <button
                      className={`${styles.tab} ${activeTab === 'lugar' ? styles.tabActive : ''}`}
                      onClick={() => setActiveTab('lugar')}
                    >
                      <MapPin size={14} style={{ marginRight: '4px' }} /> Lugar
                    </button>
                  )}
                </div>

                <div className={styles.placeInfo}>
                  {activeTab === 'lugar' && selectedPlace ? (
                    // ── Card de información del lugar ─────────────────
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Nombre y categoría */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '12px',
                          background: '#FCA311', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', flexShrink: 0,
                        }}>
                          {selectedPlace.properties?.maki === 'restaurant' ? <Utensils size={24} color="#fff" /> :
                           selectedPlace.properties?.maki === 'hospital' ? <Hospital size={24} color="#fff" /> :
                           selectedPlace.properties?.maki === 'bank' ? <Landmark size={24} color="#fff" /> :
                           selectedPlace.properties?.maki === 'school' ? <GraduationCap size={24} color="#fff" /> :
                           selectedPlace.properties?.maki === 'fuel' ? <Fuel size={24} color="#fff" /> :
                           selectedPlace.properties?.maki === 'cafe' ? <Coffee size={24} color="#fff" /> :
                           selectedPlace.properties?.maki === 'park' ? <TreePine size={24} color="#fff" /> :
                           selectedPlace.properties?.maki === 'pharmacy' ? <Pill size={24} color="#fff" /> :
                           <MapPin size={24} color="#fff" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: '#1a1a2e', lineHeight: 1.2 }}>
                            {selectedPlace.text || selectedPlace.place_name.split(',')[0]}
                          </div>
                          {selectedPlace.properties?.category && (
                            <div style={{
                              fontSize: '11px', fontWeight: 700,
                              color: '#FCA311', textTransform: 'uppercase', letterSpacing: '0.5px',
                              marginTop: '3px',
                            }}>
                              {selectedPlace.properties.category.split(',')[0]}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dirección */}
                      <div style={{
                        background: '#f8fafc', borderRadius: '10px',
                        padding: '10px 14px', display: 'flex', gap: '8px', alignItems: 'flex-start',
                      }}>
                        <MapPin size={15} color="#94a3b8" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '13px', color: '#475569', lineHeight: 1.4 }}>
                          {selectedPlace.place_name}
                        </span>
                      </div>

                      {/* Coordenadas */}
                      <div style={{
                        background: '#f8fafc', borderRadius: '10px',
                        padding: '10px 14px', display: 'flex', gap: '8px', alignItems: 'center',
                      }}>
                        <Navigation size={14} color="#94a3b8" />
                        <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                          {selectedPlace.center[1].toFixed(6)}, {selectedPlace.center[0].toFixed(6)}
                        </span>
                      </div>

                      {/* Contexto (ciudad, país) */}
                      {selectedPlace.context && selectedPlace.context.length > 0 && (
                        <div style={{
                          background: '#f8fafc', borderRadius: '10px',
                          padding: '10px 14px', display: 'flex', flexWrap: 'wrap' as const, gap: '6px',
                        }}>
                          {selectedPlace.context.slice(0, 3).map((c, i) => (
                            <span key={i} style={{
                              fontSize: '11px', background: '#e2e8f0',
                              borderRadius: '6px', padding: '3px 8px', color: '#475569', fontWeight: 600,
                            }}>
                              {c.text}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Acciones */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                          style={{
                            flex: 1, padding: '10px', background: '#FCA311',
                            border: 'none', borderRadius: '10px', color: '#fff',
                            fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                          }}
                          onClick={() => {
                            if (onSetDestRef?.current) {
                              onSetDestRef.current(selectedPlace.place_name, selectedPlace.center);
                            }
                            setMenuOpen(false);
                          }}
                        >
                          Ir aquí
                        </button>
                      </div>
                    </div>
                  ) : activeTab === 'origin' ? (
                    <>
                      <div className={styles.placeIcon}><MapPin size={20} color="#4a90e2" /></div>
                      <div className={styles.placeName}>{routeInfo.originName.split(',')[0]}</div>
                      <div className={styles.placeAddress}>{routeInfo.originName}</div>
                      <div className={styles.placeCoords}>
                        <Navigation size={12} color="#64748b" style={{ marginRight: '4px' }} />
                        {routeInfo.originCoords[1].toFixed(6)}, {routeInfo.originCoords[0].toFixed(6)}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.placeIcon}><MapPin size={20} color="#e74c3c" /></div>
                      <div className={styles.placeName}>{routeInfo.destinationName.split(',')[0]}</div>
                      <div className={styles.placeAddress}>{routeInfo.destinationName}</div>
                      <div className={styles.placeCoords}>
                        <Navigation size={12} color="#64748b" style={{ marginRight: '4px' }} />
                        {routeInfo.destinationCoords[1].toFixed(6)}, {routeInfo.destinationCoords[0].toFixed(6)}
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
              <button className={styles.drawerMenuItem} onClick={() => setMenuOpen(false)}>
                <span>Reportar bloqueo</span><ChevronRight size={16} />
              </button>
              <button className={styles.drawerMenuItem} disabled style={{ opacity: 0.4 }}>
                <span>Configuración</span><ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default RoutePanel;