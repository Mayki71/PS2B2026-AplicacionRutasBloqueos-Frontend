import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/register.css";
import { authService } from "../../services/authService";
import { useUI } from "../../../../components/UIProvider";
import { useFormValidation, parseBackendErrors } from "../../hooks/useFormValidation";
import { Eye, EyeOff, Check, X } from "lucide-react";

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  acceptedTerms: boolean;
}

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  isActive: boolean;
}

const VALIDATED_FIELDS = [
  "nombre",
  "apellido_paterno",
  "apellido_materno",
  "email",
  "password",
];

const RegisterForm = ({ onSwitchToLogin, isActive }: RegisterFormProps) => {
  const navigate = useNavigate();
  const { showToast } = useUI();

  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    telefono: "",
    acceptedTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [confirmTouched, setConfirmTouched] = useState(false);
  const [confirmError, setConfirmError] = useState<string>("");

  const {
    errors,
    touchField,
    validateAll,
    setServerFieldErrors,
    hasVisibleError,
    hasAnyError,
    resetValidation,
  } = useFormValidation(VALIDATED_FIELDS);

  const validateConfirm = (password: string, confirm: string): string => {
    if (!confirm) return "Confirma tu contraseña";
    if (password !== confirm) return "Las contraseñas no coinciden";
    return "";
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setServerError(null);

    if (type === "checkbox") return;

    if (name === "confirmPassword") {
      if (confirmTouched) {
        setConfirmError(validateConfirm(formData.password, value));
      }
      return;
    }

    if (name === "password" && confirmTouched) {
      setConfirmError(validateConfirm(value, formData.confirmPassword));
    }

    touchField(name, value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    const { name, value, type } = e.target;
    if (type === "checkbox") return;

    if (name === "confirmPassword") {
      setConfirmTouched(true);
      setConfirmError(validateConfirm(formData.password, value));
      return;
    }

    touchField(name, value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setServerError(null);

    if (!formData.acceptedTerms) {
      setServerError("Debes aceptar los términos y condiciones");
      showToast("Debes aceptar los términos y condiciones", "warning");
      return;
    }

    const isValid = validateAll({
      nombre: formData.nombre,
      apellido_paterno: formData.apellido_paterno,
      apellido_materno: formData.apellido_materno,
      email: formData.email,
      password: formData.password,
    });

    const confirmErr = validateConfirm(formData.password, formData.confirmPassword);
    setConfirmTouched(true);
    setConfirmError(confirmErr);

    if (!isValid || confirmErr) {
      showToast("Revisa los campos con errores antes de continuar", "warning");
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        apellido_paterno: formData.apellido_paterno,
        apellido_materno: formData.apellido_materno,
        telefono: formData.telefono,
      });

      resetValidation();
      navigate("/revisar-correo", { state: { email: formData.email } });
    } catch (err: any) {
      const msg = err.message || "Error al registrarse";
      const messages = Array.isArray(err.messages) ? err.messages : [msg];
      const fieldErrors = parseBackendErrors(messages);

      if (Object.keys(fieldErrors).length > 0) {
        setServerFieldErrors(fieldErrors);
        showToast("Revisa los campos con errores", "error");
      } else {
        setServerError(msg);
        showToast(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderField = (
    id: string,
    name: string,
    label: string,
    type: string,
    placeholder: string,
    autoComplete?: string,
  ) => (
    <div className={`register-form__field${hasVisibleError(name) ? " register-form__field--error" : ""}`}>
      <label className="register-form__label" htmlFor={id}>
        {label}
      </label>
      <div className="register-form__input-wrapper">
        <input
          className={`register-form__input${hasVisibleError(name) ? " register-form__input--error" : ""}`}
          id={id}
          type={type}
          name={name}
          value={formData[name as keyof RegisterFormData] as string}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={hasVisibleError(name)}
          aria-describedby={hasVisibleError(name) ? `${id}-error` : undefined}
        />
      </div>
      {hasVisibleError(name) && (
        <span className="form-field-error" id={`${id}-error`} role="alert">
          {errors[name]}
        </span>
      )}
    </div>
  );

  const hasConfirmError = confirmTouched && !!confirmError;

  return (
    <div className="register-form-container">
      <div className="register-form-section">
        <h2 className="register-form-section__title">Crea tu cuenta</h2>
        <p className="register-form-section__subtitle">
          Ingresa tus datos para continuar
        </p>
      </div>

      {serverError && (
        <div className="form-server-error" role="alert">
          {serverError}
        </div>
      )}

      <form className="register-form" onSubmit={handleSubmit} noValidate>
        {renderField("reg-nombre", "nombre", "Nombre", "text", "Ej. Juan", "given-name")}
        {renderField("reg-ap-paterno", "apellido_paterno", "Apellido Paterno", "text", "Ej. Pérez", "family-name")}
        {renderField("reg-ap-materno", "apellido_materno", "Apellido Materno", "text", "Ej. López")}
        {renderField("reg-email", "email", "Correo electrónico", "email", "correo@ejemplo.com", "email")}
        {/* Contraseña */}
        <div className={`register-form__field${hasVisibleError("password") ? " register-form__field--error" : ""}`}>
          <label className="register-form__label" htmlFor="reg-password">
            Contraseña
          </label>
          <div className="register-form__input-wrapper" style={{ position: 'relative' }}>
            <input
              className={`register-form__input${hasVisibleError("password") ? " register-form__input--error" : ""}`}
              id="reg-password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              autoComplete="new-password"
              style={{ paddingRight: '40px' }}
              aria-invalid={hasVisibleError("password")}
              aria-describedby={hasVisibleError("password") ? "reg-password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          {/* Checklist de requisitos (solo visible al escribir) */}
          {formData.password.length > 0 && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', paddingLeft: '2px' }}>
              <div style={{ color: formData.password.length >= 8 ? '#10b981' : '#888', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}>
                {formData.password.length >= 8 ? <Check size={14} strokeWidth={3} /> : <div style={{width:'14px',height:'14px',borderRadius:'50%',border:'1.5px solid #888'}}/>} Mínimo 8 caracteres
              </div>
              <div style={{ color: /[A-Z]/.test(formData.password) ? '#10b981' : '#888', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}>
                {/[A-Z]/.test(formData.password) ? <Check size={14} strokeWidth={3} /> : <div style={{width:'14px',height:'14px',borderRadius:'50%',border:'1.5px solid #888'}}/>} Debe incluir al menos una mayúscula
              </div>
              <div style={{ color: /\d/.test(formData.password) ? '#10b981' : '#888', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}>
                {/\d/.test(formData.password) ? <Check size={14} strokeWidth={3} /> : <div style={{width:'14px',height:'14px',borderRadius:'50%',border:'1.5px solid #888'}}/>} Debe incluir al menos un número
              </div>
              <div style={{ color: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? '#10b981' : '#888', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}>
                {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? <Check size={14} strokeWidth={3} /> : <div style={{width:'14px',height:'14px',borderRadius:'50%',border:'1.5px solid #888'}}/>} Debe incluir al menos un símbolo
              </div>
            </div>
          )}
        </div>

        {/* Confirmar contraseña */}
        <div className={`register-form__field${hasConfirmError ? " register-form__field--error" : ""}`}>
          <label className="register-form__label" htmlFor="reg-confirm-password">
            Confirmar Contraseña
          </label>
          <div className="register-form__input-wrapper" style={{ position: 'relative' }}>
            <input
              className={`register-form__input${hasConfirmError ? " register-form__input--error" : ""}`}
              id="reg-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              style={{ paddingRight: '40px' }}
              aria-invalid={hasConfirmError}
              aria-describedby={hasConfirmError ? "reg-confirm-password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {hasConfirmError && (
            <span className="form-field-error" id="reg-confirm-password-error" role="alert">
              {confirmError}
            </span>
          )}
        </div>

        <div className="register-form__checkbox-row">
          <input
            className="register-form__checkbox"
            id="reg-terms"
            type="checkbox"
            name="acceptedTerms"
            checked={formData.acceptedTerms}
            onChange={handleChange}
          />
          <label className="register-form__checkbox-label" htmlFor="reg-terms">
            Acepto los{" "}
            <a
              href="#terminos"
              className="register-form__terms-link"
              onClick={(e) => { e.preventDefault(); setShowTerms(true); }}
            >
              Términos y Condiciones
            </a>
          </label>
        </div>

        <button
          className="register-form__submit"
          type="submit"
          disabled={loading || hasAnyError()}
        >
          {loading ? "Creando cuenta..." : "Crear Cuenta"}
        </button>
      </form>

      <p className="register-form__switch-text">
        ¿Ya tienes cuenta?{" "}
        <button
          className="register-form__switch-link"
          type="button"
          onClick={onSwitchToLogin}
        >
          Inicia sesión
        </button>
      </p>

      {/* MODAL TÉRMINOS Y CONDICIONES */}
      {showTerms && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px',
            maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1a1a2e', fontFamily: 'Nunito, sans-serif', fontWeight: 800 }}>Términos y Condiciones</h3>
              <button onClick={() => setShowTerms(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', fontSize: '14px', color: '#444', lineHeight: 1.6, fontFamily: 'Nunito, sans-serif' }}>
              <h4 style={{ color: '#1a1a2e', marginBottom: '8px' }}>1. Introducción</h4>
              <p style={{ marginBottom: '16px' }}>Bienvenido al Sistema de Reporte de Rutas y Bloqueos. Al registrarte y utilizar nuestra plataforma, aceptas cumplir con los siguientes términos y condiciones. Si no estás de acuerdo con alguno de los términos, te pedimos que no utilices la aplicación.</p>
              
              <h4 style={{ color: '#1a1a2e', marginBottom: '8px' }}>2. Uso de la Aplicación</h4>
              <p style={{ marginBottom: '16px' }}>Nuestra plataforma permite a los usuarios compartir y visualizar reportes en tiempo real sobre bloqueos y estado de rutas. Te comprometes a proporcionar información veraz, precisa y responsable. El uso indebido, como la creación de reportes falsos repetitivos, podrá resultar en la suspensión temporal o definitiva de tu cuenta.</p>
              
              <h4 style={{ color: '#1a1a2e', marginBottom: '8px' }}>3. Privacidad y Datos Personales</h4>
              <p style={{ marginBottom: '16px' }}>Tus datos personales (nombre, correo, ubicación compartida temporalmente) serán tratados bajo estricta confidencialidad. No compartiremos tu información con terceros sin tu consentimiento, salvo por requerimientos legales.</p>
              
              <h4 style={{ color: '#1a1a2e', marginBottom: '8px' }}>4. Responsabilidad del Usuario</h4>
              <p style={{ marginBottom: '16px' }}>Eres responsable de mantener la confidencialidad de tu contraseña y cuenta. Cualquier actividad realizada bajo tu cuenta será de tu entera responsabilidad.</p>
              
              <h4 style={{ color: '#1a1a2e', marginBottom: '8px' }}>5. Modificaciones del Servicio</h4>
              <p style={{ marginBottom: '16px' }}>Nos reservamos el derecho a modificar, suspender o interrumpir el servicio en cualquier momento con el objetivo de realizar mantenimiento o actualizaciones necesarias para mejorar la plataforma.</p>
              
              <p style={{ color: '#888', fontStyle: 'italic', fontSize: '12px' }}>Última actualización: Mayo 2026</p>
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setShowTerms(false)}
                style={{ background: 'none', color: '#666', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Cerrar
              </button>
              <button 
                onClick={() => {
                  setFormData(prev => ({ ...prev, acceptedTerms: true }));
                  setShowTerms(false);
                }}
                style={{ background: '#FCA311', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e0920f'}
                onMouseOut={(e) => e.currentTarget.style.background = '#FCA311'}
              >
                Aceptar Términos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;