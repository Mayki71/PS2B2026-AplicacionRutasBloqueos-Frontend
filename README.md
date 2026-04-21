<<<<<<< HEAD
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
=======
# 🚧 **Sistema de Alertas de Bloqueos Viales (Frontend)**
### Proyecto de: **Sucha-Soft Studios**

---

## 🧩 **Descripción General**

El **Sistema de Alertas de Bloqueos Viales** tiene como objetivo proporcionar una plataforma inteligente para la **detección, reporte y visualización de bloqueos viales en tiempo real**, permitiendo a los usuarios evitar zonas afectadas mediante rutas alternativas.

El sistema está diseñado como una **aplicación web moderna e interactiva**, enfocada en la experiencia del usuario y la visualización geoespacial.

Este frontend permite:
- 🗺️ Visualización de bloqueos en mapa en tiempo real
- 📍 Marcadores dinámicos de ubicación
- 🔎 Búsqueda de ubicaciones
- 🚧 Filtros de reportes (activos, confirmados, antiguos)
- 🛣️ Trazado de rutas evitando bloqueos (Mapbox)

---

## 👥 **Equipo de Desarrollo por Módulos**

| Rol | Integrante |
| :--- | :--- |
| 🗺️ **Módulo de Mapa y Navegación** | Miguel Ángel Cárdenas Kelca |
| 🚧 **Módulo de Reportes de Bloqueos** | Benjamin Emanuel Calle Ergueta |
| ⚙️ **Módulo de Administración y Plataforma** | Jeremy Josué Gallo Rodríguez |
| 🔐 **Módulo de Autenticación y Usuarios** | Samuel Alejandro Vicente Ruiz |

---

## 🛠️ **Tecnologías Utilizadas**

| Componente | Tecnologías |
| :--- | :--- |
| 🌐 **Frontend Web** | React + TypeScript |
| 🗺️ **Mapas y Geolocalización** | Mapbox |
| 🔙 **API Backend** | NestJS |
| 🧠 **Metodología** | Scrum |
| 🧰 **Control de Versiones** | Git / GitHub |

---
 
## 📎 **Enlaces del Proyecto**
 
| Recurso | Enlace |
| :--- | :--- |
| 🗂️ **Tablero Kanban** | [Abrir en Kanban](https://github.com/users/Mayki71/projects/2) |
| 💻 **Repositorio GitHub del Backend** | [Ver Repositorio](https://github.com/Mayki71/PS2B2026-AplicacionRutasBloqueos-Backend.git) |
| 💻 **Repositorio GitHub del Frontend** | [Ver Repositorio](https://github.com/Mayki71/PS2B2026-AplicacionRutasBloqueos-Frontend.git) |
| 🛢 **BD Supabase Postgres** | [Ver BD](https://supabase.com/dashboard/project/ckyugbvytwvrvhkfmcri) |
 
---

 ## 📎 **Enlaces de Documentos**
 
| Recurso | Enlace |
| :--- | :--- |
| 📄 **Documento del Proyecto** | [Proximamente en Word]() |
| 📄 **Manual de Usuario** | [Proximamente en Word]() |
| 📄 **Manual Técnico** | [Proximamente en Word]() |
 
---

## 🧠 **Metodología de Trabajo**

El desarrollo del sistema se realiza bajo **Scrum**, organizando el trabajo en:
- 📌 Sprints cortos
- 📌 Historias de usuario
- 📌 Tablero Kanban
- 📌 Revisión continua de avances

---

## 💡 **Autoría y Derechos**

Desarrollado por el equipo **Sucha-Soft Studios**
<img width="100" height="100" alt="Gemini_Generated_Image_ae8jxhae8jxhae8j (1)" src="https://github.com/user-attachments/assets/74e8e8a0-97aa-4270-9cca-eb92980f1496" />
📍 Proyecto académico – **Universidad del Valle (UNIVALLE Bolivia)**
© 2026 Todos los derechos reservados.
>>>>>>> efa191fb1bd130b5121646651f541dad203e2eaf
