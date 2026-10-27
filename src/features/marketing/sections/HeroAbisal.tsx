import type { CSSProperties } from "react";
import Image from "next/image";
import { IMAGE_QUALITY } from "@/utils/image";
import Link from "next/link";
import type { Route } from "next";
import { ChevronDown } from "lucide-react";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { getHeroCreature } from "../data/hero-creature";

/** Burbujas colocadas a mano (spec §5): `left` 8–92 %, 6–14 px, retardo 0–9 s, subida de 12–18 s. */
const BUBBLES = [
  { left: "8%", size: 8, delay: 0, duration: 14 },
  { left: "19%", size: 12, delay: 4.5, duration: 17 },
  { left: "33%", size: 6, delay: 2, duration: 12 },
  { left: "51%", size: 10, delay: 7, duration: 16 },
  { left: "66%", size: 14, delay: 1, duration: 18 },
  { left: "79%", size: 7, delay: 5.5, duration: 13 },
  { left: "92%", size: 9, delay: 9, duration: 15 },
] as const;

/** Retardo de la entrada escalonada (`.hero-rise`). */
const rise = (seconds: number): CSSProperties => ({
  animationDelay: `${seconds}s`,
});

/**
 * Primera pantalla de la landing (spec 2026-10-27 §5): un expediente de `HERO_POOL`, distinto en cada visita, emerge de
 * la oscuridad detrás del título, el buscador y el chip que lleva a su ficha. Capas (de atrás hacia delante, todas
 * `aria-hidden`): criatura, velo de «emerger», velos de contraste y burbujas. Sin luz cáustica propia: la del fondo
 * del layout ya existe, y una segunda capa con `mix-blend-mode` sobre la imagen costaba GPU en cada frame. Todo lo
 * que se anima son `transform` y `opacity` (compositor); nada de `filter`/`blur`, que repintaban la imagen entera.
 * no tocar el contraste calibrado en #66.
 *
 * Contraste (≥ 4.5:1 detrás de todo el texto, sea cual sea la imagen, incluso una de fondo blanco como el boceto de
 * El Gran Majá). A diferencia del hero anterior (#66), aquí la criatura es la protagonista, así que el velo no cubre
 * todo el hero: solo lo que hay detrás del texto.
 *  - Banda superior (todos los tamaños): alfa 0.6 en los primeros 80 px (la navbar, que ya lleva su cristal) y se desvanece a 10 rem.
 *  - Móvil y tablet (< lg): hero de 100svh, velo base 0.25 sobre toda la imagen (se ve la criatura) y el contenido
 *    al pie (`justify-end`) con su propio velo (`before:`), transparente en el borde superior del bloque, 0.6 en la
 *    primera línea blanca del h1 (necesita 0.58) y 0.88 en la línea naranja (sobre blanco puro, #FF7300 da 4.99:1
 *    con 0.85). Por debajo, 0.92.
 *  - lg y xl: la imagen ocupa el 72 % derecho; el texto, una columna del 52 % del contenedor (termina antes del
 *    56 % del viewport en cualquier ancho), y el velo horizontal se mantiene en 0.9 hasta el 56 % y cae a 0 en el
 *    78 %. El h1 baja a 48 px en lg (60 px desde xl) para caber en la columna sin partir «de mis universos».
 *  - Fundido inferior (lg+): el tercio bajo se funde con el fondo fijo del layout en vez de cortarse en seco.
 * Sin expediente (pool vacío o sin candidatos), el hero se pinta solo con el degradado y sin chip.
 */
export async function HeroAbisal() {
  const hero = await getHeroCreature();
  const creature = hero?.creature;
  const fm = creature?.frontmatter;

  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_88%,transparent)]"
      >
        {/* La toma propia del pool o, si falta, la portada de la ficha (ya filtrada por `coverOf` en el sorteo). */}
        {hero && (
          <div className="hero-creature absolute inset-0 lg:left-[28%]">
            <Image
              src={hero.image}
              alt=""
              fill
              // En lg+ la imagen ocupa el 72 % derecho; con `100vw` el navegador pedía 1920 px.
              sizes="(min-width: 1024px) 72vw, 100vw"
              quality={IMAGE_QUALITY}
              fetchPriority="high"
              loading="eager"
              className="object-cover"
              style={{ objectPosition: hero.imagePosition }}
            />
          </div>
        )}
        {/* «Emerger»: un velo opaco que se disuelve (solo opacidad: lo mueve el compositor, sin filtros ni blur). */}
        <div className="hero-emerge-veil absolute inset-0 bg-[#00122E]" />
        {/* < lg: velo base ligero; el velo del texto va pegado al contenido (abajo, `before:`). */}
        <div className="absolute inset-0 bg-[#00122E]/25 lg:hidden" />
        {/* lg+: el texto vive en la columna izquierda → velo horizontal ≥ 0.85 hasta el 56 %; la criatura, a la derecha. */}
        <div className="absolute inset-0 hidden bg-[linear-gradient(to_right,rgba(0,18,46,0.94)_0%,rgba(0,18,46,0.9)_56%,rgba(0,18,46,0.5)_65%,rgba(0,18,46,0.12)_78%,transparent_100%)] lg:block" />
        {/* Banda superior: la navbar siempre sobre fondo oscuro. */}
        <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,rgba(0,18,46,0.6)_0,rgba(0,18,46,0.6)_80px,transparent_100%)]" />
        <div className="absolute inset-x-0 bottom-0 hidden h-1/3 bg-[linear-gradient(to_top,#00122E_0%,rgba(0,18,46,0.6)_50%,transparent_100%)] lg:block" />
        {BUBBLES.map((b) => (
          <span
            key={b.left}
            className="hero-bubble"
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="relative flex min-h-[100svh] flex-col justify-end lg:min-h-[88svh] lg:justify-center">
        {/* < lg: velo pegado al bloque de texto: empieza transparente en el borde del bloque (8 rem sobre el h1, su `pt-32`),
            0.6 en la primera línea blanca (necesita 0.58) y 0.88 en la línea naranja (necesita 0.85). */}
        <div className="container relative mx-auto flex flex-col px-6 pb-20 pt-32 before:absolute before:-inset-x-[100vw] before:top-0 before:bottom-0 before:-z-10 before:bg-[linear-gradient(to_bottom,transparent_0,rgba(0,18,46,0.6)_8rem,rgba(0,18,46,0.88)_13rem,rgba(0,18,46,0.92)_100%)] md:pt-40 lg:max-w-none lg:before:hidden short-screen:pb-10 short-screen:pt-28">
          <div className="lg:max-w-[52%]">
            <h1
              className="hero-rise font-display-wide break-words hyphens-auto text-3xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl xl:text-6xl"
              style={rise(0.1)}
            >
              Explora la inmensidad{" "}
              <span className="block italic text-primary">
                de mis universos
              </span>
            </h1>
            <p
              className="hero-rise mt-4 text-lg text-white/80"
              style={rise(0.2)}
            >
              Todo el lore oficial de BorisaoBlois en un solo archivo.
            </p>
            <div className="hero-rise mt-6 max-w-xl" style={rise(0.3)}>
              <SearchTrigger variant="hero" />
            </div>
            {creature && fm && (
              <Link
                href={`/wiki/${creature.slug}` as Route}
                className="hero-rise mt-4 inline-flex min-h-11 items-center self-start rounded-full border border-white/15 bg-[#061a2e]/90 px-4 text-sm text-white transition-colors hover:border-primary/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
                style={rise(0.4)}
              >
                <span>
                  En pantalla: <strong className="font-bold">{fm.title}</strong>{" "}
                  · Ver expediente <span aria-hidden="true">›</span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* «Sumérgete»: baja a los universos. El contenido deja `pb-24`, así que nunca lo pisa. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <a
          href="#universos"
          className="hero-rise pointer-events-auto inline-flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-sm px-3 text-[11px] font-bold uppercase tracking-wider text-white/70 transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
          style={rise(0.8)}
        >
          Sumérgete
          <ChevronDown aria-hidden="true" className="hero-bob h-5 w-5" />
        </a>
      </div>
    </section>
  );
}
