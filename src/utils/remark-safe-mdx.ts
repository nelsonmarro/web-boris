/**
 * Hace seguro un MDX que no viene del repositorio (spec CMS §4.5): lo que Boris escribe en el panel se guarda en la
 * base y se compila en el servidor, y en MDX una expresión `{…}`, un `import` o un atributo `src={…}` son código que
 * se ejecuta. Este plugin deja solo texto, Markdown y los componentes y etiquetas permitidos, con atributos literales.
 * Puro: imports relativos con `.ts` para que `node:test` lo cargue sin el alias `@/`.
 */

interface Attribute { type: string; name?: string; value?: unknown }
interface Node { type: string; name?: string | null; url?: string; value?: string; attributes?: Attribute[]; children?: Node[]; position?: { start?: { line?: number } } }

/** Etiquetas HTML que puede llevar una ficha. Nada que cargue o ejecute contenido ajeno (`script`, `iframe`, `style`…). */
export const SAFE_HTML_TAGS: ReadonlySet<string> = new Set([
  'a', 'abbr', 'b', 'blockquote', 'br', 'cite', 'code', 'dd', 'del', 'details', 'div', 'dl', 'dt', 'em', 'figcaption',
  'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'kbd', 'li', 'mark', 'ol', 'p', 'pre', 'q', 's', 'small',
  'span', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul',
]);

/** Atributos que nunca pasan: manejadores de eventos, estilos y clases (podrían tapar la página) y HTML crudo. */
const isForbiddenAttribute = (name: string): boolean =>
  /^on/i.test(name) || ['style', 'class', 'classname', 'id', 'dangerouslysetinnerhtml', 'srcdoc', 'formaction', 'ref', 'key'].includes(name.toLowerCase());

const URL_ATTRIBUTES = new Set(['href', 'src', 'poster', 'cite']);

/** Una URL sin esquema (ruta, ancla) o con `http(s)`, `mailto` o `tel`. Fuera `javascript:`, `data:`, `vbscript:`… */
export function isSafeUrl(url: string): boolean {
  // Los navegadores ignoran espacios y caracteres de control dentro del esquema (`java\tscript:`).
  const compact = url.replace(/[\u0000- \u007f-\u009f]/g, '');
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(compact)?.[1]?.toLowerCase();
  return scheme === undefined || ['http', 'https', 'mailto', 'tel'].includes(scheme);
}

export interface MdxIssue {
  /** Qué se quitó, en lenguaje llano (se enseña a quien edita). */
  message: string;
  /** Línea del texto donde aparece por primera vez, si se sabe (para llevar a ella desde el panel). */
  line?: number;
}

const JSX_TYPES = new Set(['mdxJsxFlowElement', 'mdxJsxTextElement']);
const CODE_TYPES = new Set(['mdxjsEsm', 'mdxFlowExpression', 'mdxTextExpression']);

/**
 * Limpia el árbol en el sitio y devuelve lo que ha quitado. `components` son los nombres registrados en `MdxRenderer`:
 * un componente que no está ahí rompería el render, así que también se quita.
 */
export function sanitizeMdxTree(tree: Node, components: ReadonlySet<string>): MdxIssue[] {
  const issues: MdxIssue[] = [];
  let current: Node | undefined;
  const report = (message: string) => {
    const line = current?.position?.start?.line;
    if (!issues.some((issue) => issue.message === message)) issues.push(line ? { message, line } : { message });
  };

  const clean = (node: Node): boolean => {
    current = node;
    if (CODE_TYPES.has(node.type)) {
      report(node.type === 'mdxjsEsm' ? 'Las líneas «import» y «export» no están permitidas.' : 'Las llaves { } con código no están permitidas.');
      return false;
    }
    if (JSX_TYPES.has(node.type)) {
      const name = node.name ?? '';
      // Sin nombre es un fragmento `<>…</>`: se conserva con su contenido.
      if (name && !components.has(name) && !SAFE_HTML_TAGS.has(name)) {
        report(`El bloque <${name}> no está permitido.`);
        return false;
      }
      node.attributes = (node.attributes ?? []).filter((attribute) => {
        const attributeName = attribute.name ?? '';
        // `{...props}` y `attr={expresión}` son código; un atributo literal es una cadena o no lleva valor.
        if (attribute.type !== 'mdxJsxAttribute' || (attribute.value !== null && attribute.value !== undefined && typeof attribute.value !== 'string')) {
          report(`En <${name}>, los atributos deben ir entre comillas, sin llaves { }.`);
          return false;
        }
        if (isForbiddenAttribute(attributeName)) {
          report(`En <${name}>, el atributo «${attributeName}» no está permitido.`);
          return false;
        }
        if (URL_ATTRIBUTES.has(attributeName.toLowerCase()) && typeof attribute.value === 'string' && !isSafeUrl(attribute.value)) {
          report(`En <${name}>, la dirección de «${attributeName}» no es válida.`);
          return false;
        }
        return true;
      });
    }
    if ((node.type === 'link' || node.type === 'image' || node.type === 'definition') && node.url !== undefined && !isSafeUrl(node.url)) {
      report('Hay un enlace con una dirección no válida.');
      node.url = '#';
    }
    if (node.children) node.children = node.children.filter(clean);
    return true;
  };

  clean(tree);
  return issues;
}

/** Plugin remark: va el primero en `MdxRenderer`. `onIssue` recibe lo quitado (lo usa la validación al guardar). */
export function remarkSafeMdx({ components, onIssue }: { components: ReadonlySet<string>; onIssue?: (issue: MdxIssue) => void }) {
  return (tree: Node) => {
    sanitizeMdxTree(tree, components).forEach((issue) => onIssue?.(issue));
  };
}
