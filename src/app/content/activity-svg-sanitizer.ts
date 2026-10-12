import { CssVariableName } from '../domain/types';
import { ActivityArtContent } from './edition';

/** Why an activity SVG was refused. Each class of hostile or mismatched input has its own code. */
export type ActivitySvgRejection =
  | 'parse-error'
  | 'doctype'
  | 'not-svg-root'
  | 'script'
  | 'foreign-object'
  | 'embedded-content'
  | 'animation'
  | 'style-element'
  | 'metadata'
  | 'event-attribute'
  | 'external-reference'
  | 'unsafe-css'
  | 'undeclared-variable'
  | 'unknown-element'
  | 'unknown-attribute'
  | 'invalid-attribute-value'
  | 'unexpected-node'
  | 'contract-mismatch';

export class ActivitySvgError extends Error {
  constructor(
    readonly reason: ActivitySvgRejection,
    detail: string,
  ) {
    super(`Activity SVG rejected (${reason}): ${detail}`);
    this.name = 'ActivitySvgError';
  }
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const MAX_DEPTH = 6;

const SCRIPT = new Set(['script']);
const FOREIGN = new Set(['foreignobject']);
const EMBEDDED = new Set(['iframe', 'object', 'embed', 'image', 'img', 'video', 'audio', 'canvas']);
const REFERENCING = new Set(['use', 'a', 'link', 'tref', 'feimage']);
const ANIMATION = new Set([
  'animate',
  'animatemotion',
  'animatetransform',
  'animatecolor',
  'set',
  'discard',
  'mpath',
]);

const NUMBER = String.raw`-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?`;
const PAINT = new RegExp(
  String.raw`^(?:none|#[0-9a-fA-F]{3,8}|rgba?\(\s*${NUMBER}%?(?:\s*,\s*${NUMBER}%?){2,3}\s*\))$`,
);
const NUMBER_ONLY = new RegExp(`^${NUMBER}$`);
const NUMBER_LIST = new RegExp(`^${NUMBER}(?:[\\s,]+${NUMBER})*$`);
const TRANSFORM = new RegExp(
  String.raw`^(?:\s*(?:translate|scale|rotate)\(\s*${NUMBER}(?:[\s,]+${NUMBER}){0,2}\s*\))+\s*$`,
);
const PATH_DATA = /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+-]+$/;
const ID = /^[A-Za-z][A-Za-z0-9_-]*$/;
const DATA_TOKEN = /^[A-Za-z0-9 ._-]{1,64}$/;
const STYLE =
  /^\s*(fill|stroke)\s*:\s*var\(\s*(--[a-z0-9-]+)\s*,\s*(#[0-9a-fA-F]{3,6})\s*\)\s*;?\s*$/;
const VIEW_BOX = /^0 0 \d+(?:\.\d+)? \d+(?:\.\d+)?$/;
const EXTERNAL_VALUE = /url\s*\(|@import|javascript:|data:|https?:|\/\/|expression\s*\(/i;

type ValueCheck = (value: string) => boolean;
const matches =
  (pattern: RegExp): ValueCheck =>
  (value) =>
    pattern.test(value);

const PRESENTATION: Readonly<Record<string, ValueCheck>> = {
  fill: matches(PAINT),
  stroke: matches(PAINT),
  'stroke-width': matches(NUMBER_ONLY),
  'stroke-linecap': (value) => ['butt', 'round', 'square'].includes(value),
  'stroke-linejoin': (value) => ['miter', 'round', 'bevel'].includes(value),
  'stroke-dasharray': (value) => value === 'none' || NUMBER_LIST.test(value),
  opacity: matches(NUMBER_ONLY),
};

/** Attributes each element may carry. Anything else is refused: this is an allow-list. */
const SHAPE_ATTRIBUTES: Readonly<Record<string, Readonly<Record<string, ValueCheck>>>> = {
  polyline: { points: matches(NUMBER_LIST), ...PRESENTATION },
  circle: {
    cx: matches(NUMBER_ONLY),
    cy: matches(NUMBER_ONLY),
    r: matches(NUMBER_ONLY),
    ...PRESENTATION,
  },
  ellipse: {
    cx: matches(NUMBER_ONLY),
    cy: matches(NUMBER_ONLY),
    rx: matches(NUMBER_ONLY),
    ry: matches(NUMBER_ONLY),
    ...PRESENTATION,
  },
  rect: {
    x: matches(NUMBER_ONLY),
    y: matches(NUMBER_ONLY),
    width: matches(NUMBER_ONLY),
    height: matches(NUMBER_ONLY),
    rx: matches(NUMBER_ONLY),
    ...PRESENTATION,
  },
  path: { d: matches(PATH_DATA), ...PRESENTATION },
};

const GROUP_PRESENTATION: Readonly<Record<string, ValueCheck>> = {
  fill: PRESENTATION['fill'],
  stroke: PRESENTATION['stroke'],
  'stroke-width': PRESENTATION['stroke-width'],
  transform: matches(TRANSFORM),
};

/** The extra attributes only a top-level paint-order group carries. */
const TOP_LEVEL_ATTRIBUTES: Readonly<Record<string, ValueCheck>> = {
  id: matches(ID),
  'data-group': (value) => value === 'variant' || value === 'non-variant',
  'data-slot': matches(DATA_TOKEN),
  'data-part': matches(DATA_TOKEN),
};

const ROOT_ATTRIBUTES: Readonly<Record<string, ValueCheck>> = {
  xmlns: (value) => value === SVG_NS,
  viewBox: matches(VIEW_BOX),
  'data-owner': matches(DATA_TOKEN),
  'data-activity': matches(DATA_TOKEN),
};

function reject(reason: ActivitySvgRejection, detail: string): never {
  throw new ActivitySvgError(reason, detail);
}

function elementReason(name: string): ActivitySvgRejection | null {
  const lower = name.toLowerCase();
  if (SCRIPT.has(lower)) return 'script';
  if (FOREIGN.has(lower)) return 'foreign-object';
  if (EMBEDDED.has(lower)) return 'embedded-content';
  if (REFERENCING.has(lower)) return 'external-reference';
  if (ANIMATION.has(lower)) return 'animation';
  if (lower === 'style') return 'style-element';
  if (lower === 'metadata') return 'metadata';
  return null;
}

/** Scope of one element during the walk: which slot's variables it may reference. */
interface Scope {
  readonly slotId: string | null;
  readonly declared: ReadonlySet<CssVariableName>;
}

function checkAttributes(
  element: Element,
  allowed: Readonly<Record<string, ValueCheck>>,
  scope: Scope | null,
  used: Map<string, Map<CssVariableName, Set<string>>>,
): void {
  for (const attribute of Array.from(element.attributes)) {
    const name = attribute.name;
    const lower = name.toLowerCase();
    const value = attribute.value;
    const where = `<${element.localName} ${name}>`;

    if (lower.startsWith('on')) {
      reject('event-attribute', where);
    }
    const namespaceDeclaration = name === 'xmlns' && value === SVG_NS;
    if (
      lower === 'href' ||
      lower === 'src' ||
      lower.endsWith(':href') ||
      lower.startsWith('xlink') ||
      (lower !== 'style' && !namespaceDeclaration && EXTERNAL_VALUE.test(value))
    ) {
      reject('external-reference', where);
    }
    if (lower === 'style') {
      checkStyle(element, value, scope, used);
      continue;
    }
    const check = allowed[name];
    if (!check) {
      reject('unknown-attribute', where);
    }
    if (!check(value)) {
      reject('invalid-attribute-value', `${where}="${value.slice(0, 40)}"`);
    }
  }
}

function checkStyle(
  element: Element,
  value: string,
  scope: Scope | null,
  used: Map<string, Map<CssVariableName, Set<string>>>,
): void {
  if (!SHAPE_ATTRIBUTES[element.localName]) {
    reject('unknown-attribute', `<${element.localName} style>`);
  }
  const parsed = STYLE.exec(value);
  if (!parsed) {
    reject('unsafe-css', `<${element.localName} style="${value.slice(0, 60)}">`);
  }
  const [, , variable, fallback] = parsed;
  if (!scope || scope.slotId === null || !scope.declared.has(variable)) {
    reject('undeclared-variable', `${variable} in <${element.localName}>`);
  }
  const bySlot = used.get(scope.slotId) ?? new Map<CssVariableName, Set<string>>();
  const fallbacks = bySlot.get(variable) ?? new Set<string>();
  fallbacks.add(fallback.toLowerCase());
  bySlot.set(variable, fallbacks);
  used.set(scope.slotId, bySlot);
}

function walk(
  parent: Element,
  depth: number,
  art: ActivityArtContent,
  scope: Scope | null,
  used: Map<string, Map<CssVariableName, Set<string>>>,
  output: string[],
): void {
  for (const node of Array.from(parent.childNodes)) {
    if (node.nodeType === 8) {
      continue; // comments are dropped
    }
    if (node.nodeType === 3) {
      if ((node.nodeValue ?? '').trim() !== '') {
        reject('unexpected-node', 'text content');
      }
      continue;
    }
    if (node.nodeType !== 1) {
      reject('unexpected-node', `node type ${node.nodeType}`);
    }
    const element = node as Element;
    const name = element.localName;
    const named = elementReason(name);
    if (named) {
      reject(named, `<${name}>`);
    }
    if (element.namespaceURI !== SVG_NS) {
      reject('unknown-element', `<${name}> outside the SVG namespace`);
    }
    if (depth > MAX_DEPTH) {
      reject('contract-mismatch', 'groups are nested too deeply');
    }

    if (name === 'g') {
      const topLevel = depth === 1;
      let childScope = scope;
      const allowed: Record<string, ValueCheck> = { ...GROUP_PRESENTATION };
      if (topLevel) {
        Object.assign(allowed, TOP_LEVEL_ATTRIBUTES);
        childScope = topLevelScope(element, art);
      }
      checkAttributes(element, allowed, childScope, used);
      output.push(`<g${serializeAttributes(element, topLevel)}>`);
      walk(element, depth + 1, art, childScope, used, output);
      output.push('</g>');
      continue;
    }

    const allowed = SHAPE_ATTRIBUTES[name];
    if (!allowed) {
      reject('unknown-element', `<${name}>`);
    }
    if (depth === 1) {
      reject('contract-mismatch', `<${name}> must sit inside a paint-order group`);
    }
    checkAttributes(element, allowed, scope, used);
    const hasContent = Array.from(element.childNodes).some(
      (child) =>
        child.nodeType !== 8 && (child.nodeType !== 3 || (child.nodeValue ?? '').trim() !== ''),
    );
    if (hasContent) {
      reject('unexpected-node', `<${name}> has content`);
    }
    output.push(`<${name}${serializeAttributes(element, false)}></${name}>`);
  }
}

/** Resolves a top-level group to the declared slot whose variables it may reference. */
function topLevelScope(group: Element, art: ActivityArtContent): Scope {
  const kind = group.getAttribute('data-group');
  if (kind === 'non-variant') {
    if (group.hasAttribute('data-slot')) {
      reject('contract-mismatch', `non-variant group "${group.id}" declares a slot`);
    }
    return { slotId: null, declared: new Set() };
  }
  if (kind !== 'variant') {
    return reject('contract-mismatch', `group "${group.id}" has no data-group`);
  }
  const slotId = group.getAttribute('data-slot');
  const slot = art.slots.find((candidate) => candidate.id === slotId);
  if (!slot) {
    return reject('contract-mismatch', `group "${group.id}" uses undeclared slot "${slotId}"`);
  }
  if (!slot.groups.includes(group.id)) {
    reject('contract-mismatch', `group "${group.id}" is not listed for slot "${slot.id}"`);
  }
  return { slotId: slot.id, declared: new Set(Object.keys(slot.defaults)) };
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Re-serializes the validated attributes. Group IDs are dropped: they are validation-only (R28). */
function serializeAttributes(element: Element, topLevel: boolean): string {
  return Array.from(element.attributes)
    .filter((attribute) => !(topLevel && attribute.name === 'id'))
    .map((attribute) => ` ${attribute.name}="${escapeAttribute(attribute.value)}"`)
    .join('');
}

function parse(source: string): Element {
  if (/<!\s*(?:DOCTYPE|ENTITY)/i.test(source)) {
    reject('doctype', 'DOCTYPE and entity declarations are not allowed');
  }
  let document: Document;
  try {
    document = new DOMParser().parseFromString(source, 'image/svg+xml');
  } catch (error) {
    return reject('parse-error', error instanceof Error ? error.message : 'unparseable');
  }
  const root = document.documentElement;
  if (
    !root ||
    root.localName === 'parsererror' ||
    document.getElementsByTagName('parsererror').length > 0
  ) {
    reject('parse-error', 'the markup is not well-formed XML');
  }
  if (document.doctype) {
    reject('doctype', 'DOCTYPE declarations are not allowed');
  }
  if (root.localName !== 'svg' || root.namespaceURI !== SVG_NS) {
    reject('not-svg-root', `<${root.localName}>`);
  }
  return root;
}

/**
 * Parses and strictly sanitizes one structured activity SVG against its validated edition
 * contract, and returns markup that is safe to trust (R27, R28, AC8).
 *
 * The output is rebuilt from an allow-list of elements, attributes and values; nothing from
 * the source passes through unchecked. Hostile or mismatched input is refused outright
 * with an `ActivitySvgError` rather than silently stripped:
 *
 * - script, foreignObject, embedded content, animation, style and metadata elements;
 * - event-handler attributes, external references and unsafe CSS;
 * - CSS variables the owning slot does not declare, and any slot, group or variable
 *   coverage that disagrees with `art`.
 *
 * Paint order is the source order of the top-level groups and is never changed.
 */
export function sanitizeActivitySvg(source: string, art: ActivityArtContent): string {
  const root = parse(source);

  if (root.getAttribute('viewBox') !== art.viewBox) {
    reject(
      'contract-mismatch',
      `viewBox "${root.getAttribute('viewBox')}" is not "${art.viewBox}"`,
    );
  }

  const used = new Map<string, Map<CssVariableName, Set<string>>>();
  const body: string[] = [];
  checkAttributes(root, ROOT_ATTRIBUTES, null, used);
  walk(root, 1, art, null, used, body);

  // Exact coverage: every declared group exists once, and every declared variable is used
  // with its manifest default.
  const topLevel = Array.from(root.children).filter((child) => child.localName === 'g');
  const ids = topLevel.map((group) => group.id);
  if (new Set(ids).size !== ids.length) {
    reject('contract-mismatch', 'duplicate top-level group IDs');
  }
  for (const slot of art.slots) {
    for (const groupId of slot.groups) {
      const group = topLevel.find((candidate) => candidate.id === groupId);
      if (group?.getAttribute('data-slot') !== slot.id) {
        reject('contract-mismatch', `slot "${slot.id}" is missing group "${groupId}"`);
      }
    }
    const variables = used.get(slot.id) ?? new Map<CssVariableName, Set<string>>();
    for (const [variable, fallback] of Object.entries(slot.defaults)) {
      const fallbacks = variables.get(variable);
      if (!fallbacks) {
        reject('contract-mismatch', `slot "${slot.id}" never uses ${variable}`);
      }
      if (fallbacks.size !== 1 || !fallbacks.has(fallback.toLowerCase())) {
        reject('contract-mismatch', `${variable} fallback does not match its manifest default`);
      }
    }
  }
  const claimed = new Set(art.slots.flatMap((slot) => slot.groups));
  for (const group of topLevel) {
    if (group.getAttribute('data-group') === 'variant' && !claimed.has(group.id)) {
      reject('contract-mismatch', `variant group "${group.id}" belongs to no declared slot`);
    }
  }

  const rootAttributes = serializeAttributes(root, false);
  return `<svg${rootAttributes} aria-hidden="true" focusable="false">` + body.join('') + '</svg>';
}
