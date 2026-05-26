const API_URL = import.meta.env.VITE_API_URL;

function handleUnauthorized() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.href = "/login?expired=true";
}

async function parseResponse(response: Response, isAuthCall = false) {
  // 1. Leemos primero como texto para que no explote
  const text = await response.text(); 
  
  // 2. Intentamos transformarlo a JSON si hay contenido
  const result = text ? JSON.parse(text) : {}; 

  if (response.status === 401) {
    if (!isAuthCall) {
      handleUnauthorized();
    }
    throw new Error(result.message || "No autorizado");
  }
  if (!response.ok) {
    throw new Error(result.message || `Error del servidor: ${response.status}`);
  }
  return result;
}

export const authService = {
  async register(data: {
    email: string;
    password: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    telefono: string;
  }) {
    const response = await fetch(`${API_URL}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return parseResponse(response, true);
  },

  async login(data: { email: string; password: string }) {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return parseResponse(response, true);
  },

  async getMe() {
    const token = localStorage.getItem("token") ?? "";
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return parseResponse(response);
  },

  async updateMe(data: {
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    telefono?: string;
  }) {
    const token = localStorage.getItem("token") ?? "";
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return parseResponse(response);
  },
  async resendVerification(email: string) {
    const response = await fetch(`${API_URL}/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return parseResponse(response, true);
  },
};
