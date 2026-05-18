const API_URL = import.meta.env.VITE_API_URL

export const authService = {
  async register(data: {
    email: string
    password: string
    nombre: string
    apellido_paterno: string
    apellido_materno: string
    telefono: string
  }) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message)
    return result
  },

  async login(data: { email: string; password: string }) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message)
    return result
  }
}