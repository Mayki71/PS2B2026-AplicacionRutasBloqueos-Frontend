import { useState, type FormEvent, type ChangeEvent } from "react";
import "../../styles/register.css";
import { authService } from "../../services/authService";

interface RegisterFormData {
  email: string;
  password: string;
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

const RegisterForm = ({ onSwitchToLogin, isActive }: RegisterFormProps) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    telefono: "",
    acceptedTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError(null)

    if (!formData.acceptedTerms) {
      setError('Debes aceptar los términos y condiciones')
      return
    }

    setLoading(true)
    try {
      const result = await authService.register({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        apellido_paterno: formData.apellido_paterno,
        apellido_materno: formData.apellido_materno,
        telefono: formData.telefono,
      })
      localStorage.setItem('token', result.token)
      localStorage.setItem('usuario', JSON.stringify(result.usuario))
      console.log('Registro exitoso:', result)
      // aquí después redirigís al mapa
    } catch (err: any) {
      setError(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-form-container">
      <div className="register-form-section">
        <h2 className="register-form-section__title">Crea tu cuenta</h2>
        <p className="register-form-section__subtitle">
          Ingresa tus datos para continuar
        </p>
      </div>

       <form className="register-form" onSubmit={handleSubmit} noValidate>
        <div className="register-form__field">
          <label className="register-form__label" htmlFor="reg-nombre">Nombre</label>
          <div className="register-form__input-wrapper">
            <input className="register-form__input" id="reg-nombre" type="text"
              name="nombre" value={formData.nombre} onChange={handleChange}
              placeholder="Ej. Juan" />
          </div>
        </div>

        <div className="register-form__field">
          <label className="register-form__label" htmlFor="reg-ap-paterno">Apellido Paterno</label>
          <div className="register-form__input-wrapper">
            <input className="register-form__input" id="reg-ap-paterno" type="text"
              name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange}
              placeholder="Ej. Pérez" />
          </div>
        </div>

        <div className="register-form__field">
          <label className="register-form__label" htmlFor="reg-ap-materno">Apellido Materno</label>
          <div className="register-form__input-wrapper">
            <input className="register-form__input" id="reg-ap-materno" type="text"
              name="apellido_materno" value={formData.apellido_materno} onChange={handleChange}
              placeholder="Ej. López" />
          </div>
        </div>

        <div className="register-form__field">
          <label className="register-form__label" htmlFor="reg-email">Correo electrónico</label>
          <div className="register-form__input-wrapper">
            <input className="register-form__input" id="reg-email" type="email"
              name="email" value={formData.email} onChange={handleChange}
              placeholder="correo@ejemplo.com" />
          </div>
        </div>
{/* 
        <div className="register-form__field">
          <label className="register-form__label" htmlFor="reg-phone">Teléfono (+591)</label>
          <div className="register-form__input-wrapper">
            <input className="register-form__input" id="reg-phone" type="tel"
              name="telefono" value={formData.telefono} onChange={handleChange}
              placeholder="7XXXXXXX" />
          </div>
        </div> */}

        <div className="register-form__field">
          <label className="register-form__label" htmlFor="reg-password">Contraseña</label>
          <div className="register-form__input-wrapper">
            <input className="register-form__input" id="reg-password" type="password"
              name="password" value={formData.password} onChange={handleChange}
              placeholder="•••••••" />
          </div>
        </div>

        <div className="register-form__checkbox-row">
          <input className="register-form__checkbox" id="reg-terms" type="checkbox"
            name="acceptedTerms" checked={formData.acceptedTerms} onChange={handleChange} />
          <label className="register-form__checkbox-label" htmlFor="reg-terms">
            Acepto los{' '}
            <a href="#terminos" className="register-form__terms-link"
              onClick={(e) => e.preventDefault()}>
              Términos y Condiciones
            </a>
          </label>
        </div>

        <button className="register-form__submit" type="submit" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>
      </form>

      <p className="register-form__switch-text">
        Ya tienes una cuenta?{" "}
        <button
          className="register-form__switch-link"
          type="button"
          onClick={onSwitchToLogin}
        >
          Inicia sesion
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;