import { useState, FormEvent, ChangeEvent } from "react";
import "../../styles/register.css";
import { authService } from "../../services/authService";
import { useFormValidation } from "../../hooks/useFormValidation";

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

const VALIDATED_FIELDS = [
  "nombre",
  "apellido_paterno",
  "apellido_materno",
  "email",
  // "telefono",
  "password",
];

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
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    errors,
    touchField,
    validateAll,
    setServerFieldErrors,
    hasVisibleError,
    hasAnyError,
    resetValidation,
  } = useFormValidation(VALIDATED_FIELDS);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (type !== "checkbox") touchField(name, value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    if (e.target.type !== "checkbox") touchField(e.target.name, e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setServerError(null);

    if (!formData.acceptedTerms) {
      setServerError("Debés aceptar los términos y condiciones");
      return;
    }

    const isValid = validateAll({
      nombre: formData.nombre,
      apellido_paterno: formData.apellido_paterno,
      apellido_materno: formData.apellido_materno,
      email: formData.email,
      // telefono: formData.telefono,
      password: formData.password,
    });
    if (!isValid) return;

    setLoading(true);
    try {
      const result: any = await authService.register({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        apellido_paterno: formData.apellido_paterno,
        apellido_materno: formData.apellido_materno,
        telefono: formData.telefono,
      });
      localStorage.setItem("token", result.token);
      localStorage.setItem("usuario", JSON.stringify(result.usuario));
      resetValidation();
      setSuccessMessage("¡Cuenta creada correctamente! Redirigiendo...");
    } catch (err: any) {
      setServerError(err.message || "Error de conexión, intentá de nuevo");
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
  ) => (
    <div
      className={`register-form__field ${hasVisibleError(name) ? "register-form__field--error" : ""}`}
    >
      <label className="register-form__label" htmlFor={id}>
        {label}
      </label>
      <div className="register-form__input-wrapper">
        <input
          className={`register-form__input ${hasVisibleError(name) ? "register-form__input--error" : ""}`}
          id={id}
          type={type}
          name={name}
          value={formData[name as keyof RegisterFormData] as string}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
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
      {successMessage && (
        <div className="form-server-success" role="status">
          ✓ {successMessage}
        </div>
      )}
      <form className="register-form" onSubmit={handleSubmit} noValidate>
        {renderField("reg-nombre", "nombre", "Nombre", "text", "Ej. Juan")}
        {renderField(
          "reg-ap-paterno",
          "apellido_paterno",
          "Apellido Paterno",
          "text",
          "Ej. Pérez",
        )}
        {renderField(
          "reg-ap-materno",
          "apellido_materno",
          "Apellido Materno",
          "text",
          "Ej. López",
        )}
        {renderField(
          "reg-email",
          "email",
          "Correo electrónico",
          "email",
          "correo@ejemplo.com",
        )}
        {renderField(
          "reg-password",
          "password",
          "Contraseña",
          "password",
          "•••••••",
        )}

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
              onClick={(e) => e.preventDefault()}
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
    </div>
  );
};

export default RegisterForm;
