import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';

// ── Tipos ──────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ModalConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface UIContextValue {
  showToast: (message: string, type?: ToastType) => void;
  showConfirm: (config: ModalConfig) => void;
  closeModal: () => void;
}

// ── Context ────────────────────────────────────────────────────────────────
const UIContext = createContext<UIContextValue | null>(null);

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI debe usarse dentro de <UIProvider>');
  return ctx;
}

// ── Provider ───────────────────────────────────────────────────────────────
let toastId = 0;

export function UIProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts]   = useState<Toast[]>([]);
  const [modal, setModal]     = useState<ModalConfig | null>(null);
  const [modalIn, setModalIn] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const showConfirm = useCallback((config: ModalConfig) => {
    setModal(config);
    setTimeout(() => setModalIn(true), 10);
  }, []);

  const closeModal = useCallback(() => {
    setModalIn(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setModal(null), 280);
  }, []);

  const handleConfirm = () => {
    modal?.onConfirm();
    closeModal();
  };
  const handleCancel = () => {
    modal?.onCancel?.();
    closeModal();
  };

  // Cerrar con Escape
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modal]);

  const TOAST_COLORS: Record<ToastType, { bg: string; icon: ReactNode; border: string }> = {
    success: { bg: '#f0fdf4', icon: <CheckCircle size={20} color="#22c55e" />, border: '#22c55e' },
    error:   { bg: '#fef2f2', icon: <XCircle size={20} color="#ef4444" />, border: '#ef4444' },
    warning: { bg: '#fffbeb', icon: <AlertTriangle size={20} color="#f59e0b" />, border: '#f59e0b' },
    info:    { bg: '#eff6ff', icon: <Info size={20} color="#3b82f6" />, border: '#3b82f6' },
  };

  return (
    <UIContext.Provider value={{ showToast, showConfirm, closeModal }}>
      {children}

      {/* ── TOASTS ─────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: '80px', right: '16px',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const c = TOAST_COLORS[t.type];
          return (
            <div key={t.id} style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderLeft: `4px solid ${c.border}`,
              borderRadius: '10px',
              padding: '12px 16px',
              minWidth: '220px', maxWidth: '320px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', gap: '10px',
              animation: 'slideInToast 0.3s ease',
              pointerEvents: 'auto',
              fontFamily: 'system-ui, sans-serif',
            }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{c.icon}</span>
              <span style={{ fontSize: '13px', color: '#1a1a2e', fontWeight: 500, lineHeight: 1.4 }}>
                {t.message}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── MODAL de confirmación ───────────────────────────── */}
      {modal && (
        <div
          onClick={handleCancel}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(3px)',
            opacity: modalIn ? 1 : 0,
            transition: 'opacity 0.25s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '16px',
              width: '100%', maxWidth: '380px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              transform: modalIn ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
              transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {/* Header */}
            <div style={{
              background: modal.danger ? '#fef2f2' : '#FCA311',
              padding: '20px 24px 16px',
              borderBottom: `1px solid ${modal.danger ? '#fee2e2' : 'rgba(255,255,255,0.2)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {modal.danger ? <Trash2 size={24} color="#991b1b" /> : <Info size={24} color="#fff" />}
                </span>
                <h2 style={{
                  margin: 0, fontSize: '17px', fontWeight: 800,
                  color: modal.danger ? '#991b1b' : '#fff',
                  fontFamily: 'system-ui, sans-serif',
                }}>
                  {modal.title}
                </h2>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px' }}>
              <p style={{
                margin: 0, fontSize: '14px', color: '#4b5563',
                lineHeight: 1.6, fontFamily: 'system-ui, sans-serif',
              }}>
                {modal.message}
              </p>
            </div>

            {/* Footer */}
            <div style={{
              padding: '0 24px 20px',
              display: 'flex', gap: '10px', justifyContent: 'flex-end',
            }}>
              <button
                onClick={handleCancel}
                style={{
                  padding: '10px 20px', borderRadius: '8px', border: '1.5px solid #e5e7eb',
                  background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', transition: 'background 0.15s',
                  fontFamily: 'system-ui, sans-serif',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
              >
                {modal.cancelLabel ?? 'Cancelar'}
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  padding: '10px 20px', borderRadius: '8px', border: 'none',
                  background: modal.danger ? '#ef4444' : '#FCA311',
                  color: '#fff', fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', transition: 'opacity 0.15s',
                  fontFamily: 'system-ui, sans-serif',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {modal.confirmLabel ?? 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animación del toast */}
      <style>{`
        @keyframes slideInToast {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </UIContext.Provider>
  );
}
