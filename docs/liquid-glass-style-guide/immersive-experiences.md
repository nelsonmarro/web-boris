# HIG: Immersive Experiences (Experiencias Inmersivas)

Con el sistema Liquid Glass, las interfaces están diseñadas para sentirse como si existieran en un espacio físico tridimensional.

## Principios Inmersivos
- **Capas Funcionales:** Los elementos de UI ahora "flotan" sobre el contenido. Esta separación se logra mediante **refracción y profundidad** en lugar de sombras tradicionales.
- **Interacción Discreta:** La interfaz debe retroceder cuando no está en uso para dejar que el contenido sea el protagonista.
- **Geometría Concéntrica:** Principio de "geometría tranquila" que alinea la curvatura de la UI con los bordes del dispositivo de hardware (Hardware-Software Unity).

## Implementación en el Proyecto
- **Banner Liquid Glass:** Diseñado con un desenfoque ultra profundo para que parezca flotar sobre el fondo abisal.
- **Glow Effects:** Añadimos halos de luz detrás de los contenedores para simular profundidad física y un sentido de "aura".
- **Reflexiones Dinámicas:** Las capas de brillo (`glass-shine`) imitan la luz del entorno sobre el material.
