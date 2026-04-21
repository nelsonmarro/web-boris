# HIG: Materials (Materiales / Liquid Glass)

Los materiales proporcionan una sensación de profundidad y separación entre la interfaz y el contenido.

## Concepto: Liquid Glass (WWDC 2025)
- **Soft Edges (Bordes Suaves):** Ideal para interfaces que priorizan el flujo y el contenido (iOS/iPadOS). Proporciona transiciones sutiles para elementos interactivos.
- **Hard Edges (Bordes Rígidos):** Utilizado para controles complejos de texto, cabeceras de tablas o bordes de ventanas en macOS para mayor precisión visual.
- **Translucidez:** El cristal permite mantener el contexto de lo que hay debajo mientras asegura que el primer plano sea legible a través del desenfoque y la saturación.

## Implementación en el Proyecto
- **Utilidad `glass-liquid`:** Implementada en `globals.css` siguiendo estos estándares.
- **Reflexión:** Usamos gradientes radiales para simular fuentes de luz externas en la superficie del cristal.
- **Saturación:** Ajustada al 180% para que el fondo mantenga su color bajo el material.
