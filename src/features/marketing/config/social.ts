/**
 * Enlaces oficiales de Boris. Fuente: doc "Link Redes Sociales" en la carpeta
 * de Drive "Web Boris" (solo lista YouTube) y el PDF de requerimientos (email).
 * No añadir redes que Boris no haya confirmado.
 */
export const SOCIAL_LINKS = {
  youtube: 'https://youtube.com/@borisaoblois',
} as const;

export const YOUTUBE_HANDLE = '@BorisaoBlois';

/**
 * «Suscríbete»: el canal con `sub_confirmation=1`, que abre directamente el diálogo de suscripción de YouTube.
 * Lo usan el hero, las fichas y el pie (auditoría UX 2026-10-29: no había ninguno en toda la web).
 */
export const YOUTUBE_SUBSCRIBE_URL = 'https://www.youtube.com/@BorisaoBlois?sub_confirmation=1';

/** Id del canal: lo necesita el feed RSS público de YouTube (último vídeo del hub /comunidad). */
export const YOUTUBE_CHANNEL_ID = 'UChE8ki_10uZSZN0YTBi8_RA';

export const CONTACT_EMAIL = 'borisaoblois343@gmail.com';
