# HIG: Multitasking (Multitarea)

Las interfaces adaptables permiten que las apps transicionen sin problemas entre diferentes tamaños de ventana y configuraciones de pantalla (Split View, Slide Over).

## Principios de Multitarea
- **Persistencia de Estado:** Guarda el estado del usuario para que, al redimensionar la ventana, la posición de scroll y el contexto no se pierdan.
- **Adaptabilidad del Layout:** Las vistas de lista deben pasar a grids (y viceversa) dependiendo del ancho de la ventana disponible.
- **Múltiples Instancias:** Permite abrir múltiples ventanas de la app si el contenido es separable (ej. dos artículos de la wiki).

## Implementación en el Proyecto
- **Responsive Design:** La Wiki pasa de un grid de 3 columnas en desktop a 1 en móvil, asegurando que la lectura sea siempre el foco.
- **Article Modals:** Los modales de artículos ocupan todo el ancho en móvil (`Drawer`) pero se centran en desktop (`Dialog`), imitando el comportamiento de iPadOS.
