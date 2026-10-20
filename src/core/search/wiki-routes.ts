/**
 * Rutas propias de la wiki que no son una ficha MDX (`/wiki/<slug>`). Puro y sin imports: lo usan módulos puros
 * (`nav-neighbors`, `validate`, los tests), el cliente (paleta, menú) y el servidor (route handler).
 */
export const ARENA_ROUTE = '/wiki/arena';
export const REGISTRO_ROUTE = '/wiki/registro';
/** Route handler que redirige (307) a una ficha al azar. Todo `<Link>` a esta ruta lleva `prefetch={false}`. */
export const RANDOM_ROUTE = '/wiki/aleatorio';

/** Rutas estáticas de la wiki: una ficha MDX no puede ocupar su lugar. */
export const STATIC_WIKI_ROUTES = [ARENA_ROUTE, REGISTRO_ROUTE, RANDOM_ROUTE] as const;

/** Slugs que ningún MDX puede usar, porque la ruta estática de igual nombre ganaría (`arena`, `registro`, `aleatorio`). */
export const RESERVED_SLUGS: readonly string[] = STATIC_WIKI_ROUTES.map((route) => route.slice('/wiki/'.length));

/** URL interna de una ficha: el slug va en el grupo 1; admite `/`, `?` o `#` detrás. */
export const WIKI_LINK = /^\/wiki\/([a-z0-9-]+)(?:[/?#]|$)/;
