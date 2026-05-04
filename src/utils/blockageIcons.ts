/**
 * Configuración central de iconos para tipos de bloqueo.
 * Imágenes en: src/assets/icons/blockages/
 */

import iconTodos       from '../assets/icons/blockages/Todos_Blanco.png';
import iconAccidente   from '../assets/icons/blockages/Accidente_Rojo.png';
import iconObra        from '../assets/icons/blockages/Obras_Verde.png';
import iconBloqueo     from '../assets/icons/blockages/Bloqueos_Naranjado.png';
import iconVehiculo    from '../assets/icons/blockages/AutoAveriado_Plomo.png';
import iconInundacion  from '../assets/icons/blockages/Inundacion_Morado.png';
import iconDerrumbe    from '../assets/icons/blockages/derrumbe_Celeste.png';

export interface TipoConfig {
  icono: string;   // ruta de la imagen
  color: string;   // color de la línea en el mapa
}

export const ICONO_TODOS = iconTodos;

// Reglas de matching por palabra clave (case-insensitive)
// Orden importa: se evalúa de arriba a abajo, primera coincidencia gana
const REGLAS: Array<{ keywords: string[]; config: TipoConfig }> = [
  {
    keywords: ['accidente'],
    config: { icono: iconAccidente, color: '#e53e3e' },
  },
  {
    keywords: ['obra', 'construccion', 'construcción', 'construc'],
    config: { icono: iconObra, color: '#38a169' },
  },
  {
    keywords: ['vehiculo', 'vehículo', 'averiado', 'auto'],
    config: { icono: iconVehiculo, color: '#718096' },
  },
  {
    keywords: ['inundacion', 'inundación', 'agua'],
    config: { icono: iconInundacion, color: '#805ad5' },
  },
  {
    keywords: ['derrumbe', 'deslizamiento'],
    config: { icono: iconDerrumbe, color: '#63b3ed' },
  },
  {
    keywords: ['manifestacion', 'manifestación', 'protesta', 'marcha', 'bloqueo', 'feria', 'otro'],
    config: { icono: iconBloqueo, color: '#ed8936' },
  },
];

/** Busca la config por keywords (sin importar mayúsculas/tildes) */
function buscarConfig(nombre: string): TipoConfig {
  const n = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const regla of REGLAS) {
    if (regla.keywords.some(kw => n.includes(kw))) {
      return regla.config;
    }
  }
  // Fallback por defecto
  return { icono: iconBloqueo, color: '#ed8936' };
}

/** Devuelve la URL del icono para un tipo de bloqueo */
export function getTipoIcono(nombre: string): string {
  return buscarConfig(nombre).icono;
}

/** Devuelve el color de la línea de ruta para un tipo de bloqueo */
export function getTipoColor(nombre: string): string {
  return buscarConfig(nombre).color;
}
