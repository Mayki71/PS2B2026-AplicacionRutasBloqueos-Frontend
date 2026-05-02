const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
  async register(data: {
    email: string;
    password: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    telefono: string;
  }) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(
        Array.isArray(result.message) ? result.message[0] : result.message,
      );
    return result;
  },

  async login(data: { email: string; password: string }) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(
        Array.isArray(result.message) ? result.message[0] : result.message,
      );
    return result;
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
    const result = await response.json();
    if (!response.ok)
      throw new Error(
        Array.isArray(result.message) ? result.message[0] : result.message,
      );
    return result;
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
    const result = await response.json();
    if (!response.ok)
      throw new Error(
        Array.isArray(result.message) ? result.message[0] : result.message,
      );
    return result;
  },
};
