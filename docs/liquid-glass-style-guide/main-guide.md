# Guía de Estilos: Liquid Glass UI (Apple Guidelines)

Esta guía sintetiza los principios de diseño de **Liquid Glass**, el sistema de diseño universal introducido por Apple (WWDC 2025) para unificar interfaces a través de iOS, iPadOS y macOS. Combina las propiedades ópticas del cristal con un sentido de fluidez dinámica.

## 1. ¿Qué es Liquid Glass?

Liquid Glass es un "meta-material digital" que dobla y da forma a la luz dinámicamente, moviéndose de manera fluida como el agua. Es una evolución del "aqua" de macOS 10 y el "real-time blur" de iOS 7.

### Características Principales:
- **Lensing (Lente/Refracción):** Los elementos del fondo se doblan y distorsionan en lugar de simplemente dispersar la luz. Da una sensación de "gel" a los elementos.
- **Translucidez Adaptativa:** Revela sutilmente lo que hay debajo (ej. barras de progreso) para mejorar la precisión y el contexto.
- **Composición por Capas:**
  - **Highlight (Brillo):** Proyección de luz y movimiento en la superficie.
  - **Shadow (Sombra):** Añade profundidad para la separación entre el primer plano y el fondo.
  - **Illumination (Iluminación):** Las propiedades flexibles y adaptativas del material (tinte y saturación).

## 2. Reglas de Uso (Human Interface Guidelines)

1. **Uso Estratégico:** No debe usarse en todas partes. Es más efectivo para la **capa de navegación** (Navbars, Tab bars, Sidebars) y modales/flotantes.
2. **Evitar Cristal sobre Cristal:** Apilar elementos de cristal reduce la legibilidad y ensucia la refracción óptica.
3. **Jerarquía y Contraste:** 
   - Define un diseño que ponga el contenido más importante enfocado.
   - Sé juicioso con el uso del color en controles para que sigan siendo legibles y permitan que el contenido brille a través de ellos.
4. **Variantes de Cristal:**
   - **Regular:** El más versátil (difuminado y refracción estándar).
   - **Clear (Claro):** Menos comportamientos adaptativos, permite que el contenido sea mucho más visible bajo la superficie.

## 3. Implementación CSS (Glassmorphism Avanzado)

Para lograr el efecto Liquid Glass en la web, debemos ir más allá del simple `backdrop-filter: blur()`. Necesitamos combinar sombras internas, bordes semi-transparentes y capas de brillo.

### Estructura Base CSS

```css
.liquid-glass {
  /* Iluminación base y Tinte */
  background: rgba(255, 255, 255, 0.05); /* Tinte muy sutil */
  
  /* Lensing y Translucidez */
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  
  /* Highlight (Brillos en bordes para simular volumen) */
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  
  /* Shadow (Profundidad exterior e interior) */
  box-shadow: 
    0 8px 32px 0 rgba(0, 0, 0, 0.3), /* Sombra exterior suave */
    inset 0 1px 2px rgba(255, 255, 255, 0.4), /* Reflejo interno superior */
    inset 0 -1px 2px rgba(0, 0, 0, 0.2); /* Sombra interna inferior */
}
```

### Consideraciones de Accesibilidad
- **Contraste de Texto:** Mantener siempre un alto contraste. Usa colores neutros (blanco puro en fondos oscuros) para el texto sobre Liquid Glass.
- **Saturación:** Usar `saturate(180%)` o similar junto al `blur` ayuda a que los colores del fondo no se laven, manteniendo la viveza de la interfaz bajo el cristal.

---

*Nota: Esta guía se aplicará a las clases utilitarias de Tailwind en `globals.css` para refinar nuestro actual sistema `glass-liquid`.*
