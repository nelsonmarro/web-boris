# HIG: Search Fields (Campos de Búsqueda)

Los campos de búsqueda permiten a los usuarios filtrar grandes colecciones de contenido. Un campo de búsqueda típico incluye un icono de lupa, un campo de texto editable y un botón para borrar el contenido.

## Mejores Prácticas
- **Texto de Marcador (Placeholder):** Debe ser descriptivo. En lugar de solo "Buscar", usa algo como "Buscar criaturas, universos o leyendas".
- **Resultados en Tiempo Real:** Comienza a filtrar o mostrar resultados inmediatamente mientras el usuario escribe para proporcionar feedback instantáneo.
- **Sugerencias:** Muestra términos de búsqueda recientes o comunes antes de que el usuario empiece a escribir.
- **Botón de Borrado:** Incluye siempre un botón (X) para que el usuario pueda limpiar la búsqueda rápidamente.

## Aplicación en Borisao Wiki
- Actualizar el placeholder del buscador en `WikiList.tsx` para ser más temático.
- Asegurar que el icono de la lupa cambie de color cuando el campo esté enfocado para indicar interactividad (Liquid Glass).
