import { useState, useCallback } from "react";


export interface FieldErrors {
  [key: string]: string;
}

// Reglas de validación (sincronizadas con backend)

const VALIDATORS: Record<string, (value: string) => string | null> = {
  email: (value) => {
    if (!value.trim()) return "El correo electrónico es obligatorio";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "El correo electrónico no es válido";
    return null;
  },

  password: (value) => {
    if (!value) return "La contraseña es obligatoria";
    if (value.length < 8) return "Mínimo 8 caracteres";
    if (!/[A-Z]/.test(value)) return "Debe incluir al menos una mayúscula";
    if (!/[0-9]/.test(value)) return "Debe incluir al menos un número";
    if (!/[^a-zA-Z0-9]/.test(value)) return "Debe incluir al menos un símbolo";
    return null;
  },

  nombre: (value) => {
    if (!value.trim()) return "El nombre es obligatorio";
    if (/[0-9]/.test(value)) return "El nombre no puede contener números";
    return null;
  },

  apellido_paterno: (value) => {
    if (!value.trim()) return "El apellido paterno es obligatorio";
    if (/[0-9]/.test(value)) return "El apellido paterno no puede contener números";
    return null;
  },

  apellido_materno: (value) => {
    if (!value.trim()) return "El apellido materno es obligatorio";
    if (/[0-9]/.test(value)) return "El apellido materno no puede contener números";
    return null;
  },

  telefono: (value) => {
    if (!value.trim()) return "El teléfono es obligatorio";
    if (!/^[67]\d{7}$/.test(value)) return "Ingresá un número boliviano válido (ej. 71234567)";
    return null;
  },
};

// ── Mapeo backend → campo ─────────────────────────────────────────────────
//
// NestJS ValidationPipe devuelve message[] cuando hay múltiples errores.
// Esta función los mapea al campo del formulario para mostrarlos inline.

const BACKEND_FIELD_KEYWORDS: Array<{ keywords: string[]; field: string }> = [
  { keywords: ["correo", "email"],         field: "email" },
  { keywords: ["contraseña"],              field: "password" },
  { keywords: ["paterno"],                 field: "apellido_paterno" },
  { keywords: ["materno"],                 field: "apellido_materno" },
  { keywords: ["nombre"],                  field: "nombre" },
  { keywords: ["teléfono", "telefono"],    field: "telefono" },
];

export function parseBackendErrors(messages: string[]): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const msg of messages) {
    const lower = msg.toLowerCase();
    const match = BACKEND_FIELD_KEYWORDS.find(({ keywords }) =>
      keywords.some((kw) => lower.includes(kw))
    );
    // Solo el primer mensaje por campo, los que no matchean van al caller
    if (match && !fieldErrors[match.field]) {
      fieldErrors[match.field] = msg;
    }
  }
  return fieldErrors;
}


export function useFormValidation(fields: string[]) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((name: string, value: string): string | null => {
    const validator = VALIDATORS[name];
    if (!validator) return null;
    const error = validator(value);
    setErrors((prev) => ({ ...prev, [name]: error ?? "" }));
    return error;
  }, []);

  const touchField = useCallback((name: string, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  }, [validateField]);

  const validateAll = useCallback((data: Record<string, string>): boolean => {
    const newErrors: FieldErrors = {};
    let isValid = true;
    for (const field of fields) {
      const validator = VALIDATORS[field];
      if (!validator) continue;
      const error = validator(data[field] ?? "");
      if (error) { newErrors[field] = error; isValid = false; }
    }
    setErrors(newErrors);
    setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
    return isValid;
  }, [fields]);

  /**
   * Inyecta errores del backend directamente por campo.
   * Los marca como tocados para que sean visibles inmediatamente.
   */
  const setServerFieldErrors = useCallback((fieldErrors: FieldErrors) => {
    setErrors((prev) => ({ ...prev, ...fieldErrors }));
    setTouched((prev) => {
      const next = { ...prev };
      for (const field of Object.keys(fieldErrors)) next[field] = true;
      return next;
    });
  }, []);

  const hasVisibleError = (name: string): boolean =>
    touched[name] === true && !!errors[name];

  const hasAnyError = (): boolean =>
    fields.some((f) => touched[f] && !!errors[f]);

  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validateField,
    touchField,
    validateAll,
    setServerFieldErrors,
    hasVisibleError,
    hasAnyError,
    resetValidation,
  };
}