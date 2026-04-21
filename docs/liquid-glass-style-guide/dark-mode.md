# HIG: Dark Mode (Modo Oscuro / Apple 2025)

El Modo Oscuro es un requisito estándar y es la base de la estética abisal de BorisaoBlois.

## Principios de Dark Mode
- **Contraste Adaptativo:** El brillo de los elementos Liquid Glass se ajusta dinámicamente en entornos oscuros para prevenir la fatiga visual.
- **Hue Differentiation:** Las gamas de colores del sistema han sido ajustadas sutilmente para mejorar la diferenciación de tonos en modo oscuro.
- **Continuidad del Sistema:** Las aplicaciones deben respetar el horario de "Auto" del sistema para mantener la confianza del usuario.

## Aplicación en Borisao Wiki
- Toda la aplicación está diseñada con una base abisal oscura (`oklch(0.20 0.12 250)`).
- Las tarjetas Liquid Glass utilizan `rgba(255, 255, 255, 0.05)` para el tinte para que la oscuridad del fondo no se vea lavada por el cristal.
- Los iconos y el texto interactivo se mantienen en **Naranja Brillante** para una legibilidad instantánea en condiciones de poca luz.
