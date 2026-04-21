# HIG: Advanced Liquid Glass (Figma Insights)

Basado en el análisis del diseño de "Control Center" de Apple en Figma, esta guía profundiza en las técnicas de renderizado para lograr un realismo superior en la web.

## 1. El "Figma Stack" de Cristal
El efecto Liquid Glass más avanzado no es una sola capa, sino un apilamiento de efectos:

- **Layer 1: Base Fill:** Un color sólido muy tenue (ej. `#999999` al 10%) que actúa como el cuerpo del cristal.
- **Layer 2: Plus Lighter:** Una capa oscura (`#242424`) con el modo de mezcla `plus-lighter`. Esto permite que las luces del fondo "atraviesen" el material de manera más realista.
- **Layer 3: Color Dodge:** Brillos intensos en los bordes o puntos de contacto usando `color-dodge`.
- **Layer 4: Backdrop Blur:** Un desenfoque ultra profundo (mínimo 50px) para el efecto de lensing.
- **Layer 5: Screen/Overlay:** Un gradiente radial de brillo superior para simular la reflexión de la luz ambiente.

## 2. Lensing Dinámico
Para simular que el cristal "dobla" la luz:
- Usa `saturate(200%)` junto al desenfoque. El cristal real tiende a concentrar el color del objeto que está detrás.
- Aplica un borde superior más brillante (`rgba(255,255,255,0.3)`) y un borde inferior más oscuro o transparente para dar volumen.

## 3. Implementación de Referencia (Tailwind + CSS)

```css
.glass-advanced {
  /* Fondo transparente para que el stack sea visible */
  background: transparent;
  backdrop-filter: blur(50px) saturate(200%);
  
  /* Sombras de profundidad profunda */
  box-shadow: 
    0 40px 100px rgba(0, 0, 0, 0.5),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

/* Capas internas simuladas con pseudo-elementos o div hijos */
.glass-advanced::before {
  content: '';
  background: #242424;
  mix-blend-mode: plus-lighter;
  opacity: 0.2;
}
```

## 4. Aplicación en Borisao Wiki
- **Modales de Artículo:** Usar el `glass-advanced` para dar una sensación de que el archivo es una pieza física de tecnología abisal.
- **Control Center (Dashboard de Usuario):** El panel de control del usuario (Fase 5) debe imitar fielmente el diseño de iPadOS analizado en Figma.
