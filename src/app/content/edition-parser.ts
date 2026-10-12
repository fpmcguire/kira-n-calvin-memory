import { ChildId, CssVariableName, EligibleSlotTreatment } from '../domain/types';
import { ActivityArtContent, ArtSlot, ChildContent, EditionContent, ThemeContent } from './edition';

/** Thrown for any edition content that fails the contract; the edition is never partly used. */
export class EditionValidationError extends Error {
  constructor(
    readonly path: string,
    detail: string,
  ) {
    super(`Invalid edition content at ${path}: ${detail}`);
    this.name = 'EditionValidationError';
  }
}

const CHILD_IDS: readonly string[] = ['kira', 'calvin'] satisfies ChildId[];
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VARIABLE = /^--[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const RELATIVE_PATH = /^[A-Za-z0-9_-][A-Za-z0-9._-]*(?:\/[A-Za-z0-9_-][A-Za-z0-9._-]*)*$/;
const LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const VIEW_BOX = /^0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)$/;

/** Art objects that came out of `parseActivityArt`; the SVG repository accepts nothing else. */
const validatedArt = new WeakSet<object>();

export function isValidatedActivityArt(art: unknown): art is ActivityArtContent {
  return typeof art === 'object' && art !== null && validatedArt.has(art);
}

/** Whether `path` is a relative, same-origin edition path: no scheme, authority, query or `..`. */
export function isRelativeEditionPath(path: unknown): path is string {
  return (
    typeof path === 'string' &&
    RELATIVE_PATH.test(path) &&
    path.split('/').every((segment) => segment !== '.' && segment !== '..')
  );
}

type Json = Record<string, unknown>;

function object(value: unknown, path: string): Json {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new EditionValidationError(path, 'expected an object');
  }
  return value as Json;
}

function exactKeys(value: Json, keys: readonly string[], path: string): void {
  const extra = Object.keys(value).filter((key) => !keys.includes(key));
  const missing = keys.filter((key) => !(key in value));
  if (extra.length > 0 || missing.length > 0) {
    throw new EditionValidationError(
      path,
      `expected exactly ${keys.join(', ')}` +
        (extra.length ? `; unexpected ${extra.join(', ')}` : '') +
        (missing.length ? `; missing ${missing.join(', ')}` : ''),
    );
  }
}

function array(value: unknown, path: string, min = 0): unknown[] {
  if (!Array.isArray(value) || value.length < min) {
    throw new EditionValidationError(path, `expected an array of at least ${min}`);
  }
  return value;
}

function string(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new EditionValidationError(path, 'expected a non-empty string');
  }
  return value;
}

function id(value: unknown, path: string): string {
  const text = string(value, path);
  if (!ID.test(text)) {
    throw new EditionValidationError(path, `"${text}" is not a lowercase kebab-case ID`);
  }
  return text;
}

function variableName(value: unknown, path: string): CssVariableName {
  const text = string(value, path);
  if (!VARIABLE.test(text)) {
    throw new EditionValidationError(path, `"${text}" is not a CSS custom-property name`);
  }
  return text;
}

function color(value: unknown, path: string): string {
  const text = string(value, path);
  if (!HEX_COLOR.test(text)) {
    throw new EditionValidationError(path, `"${text}" is not a #rgb or #rrggbb color`);
  }
  return text;
}

function colorMap(value: unknown, path: string): Record<CssVariableName, string> {
  const source = object(value, path);
  const names = Object.keys(source);
  if (names.length === 0) {
    throw new EditionValidationError(path, 'expected at least one variable');
  }
  const map: Record<CssVariableName, string> = {};
  for (const name of names) {
    map[variableName(name, `${path}.${name}`)] = color(source[name], `${path}.${name}`);
  }
  return map;
}

function unique(values: readonly string[], path: string, what: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new EditionValidationError(path, `duplicate ${what} "${value}"`);
    }
    seen.add(value);
  }
}

function relativePath(value: unknown, path: string): string {
  if (!isRelativeEditionPath(value)) {
    throw new EditionValidationError(path, 'expected a relative same-origin path');
  }
  return value;
}

function parseSlot(value: unknown, path: string): ArtSlot {
  const source = object(value, path);
  exactKeys(source, ['id', 'groups', 'defaults'], path);
  const groups = array(source['groups'], `${path}.groups`, 1).map((group, index) =>
    id(group, `${path}.groups[${index}]`),
  );
  unique(groups, `${path}.groups`, 'group');
  return {
    id: id(source['id'], `${path}.id`),
    groups,
    defaults: colorMap(source['defaults'], `${path}.defaults`),
  };
}

function parseTreatment(
  value: unknown,
  path: string,
  slots: ReadonlyMap<string, ArtSlot>,
): EligibleSlotTreatment {
  const source = object(value, path);
  exactKeys(source, ['slotId', 'treatmentId', 'properties'], path);
  const slotId = id(source['slotId'], `${path}.slotId`);
  const slot = slots.get(slotId);
  if (!slot) {
    throw new EditionValidationError(`${path}.slotId`, `slot "${slotId}" is not declared`);
  }
  const properties = colorMap(source['properties'], `${path}.properties`);
  const declared = Object.keys(slot.defaults).sort();
  const supplied = Object.keys(properties).sort();
  if (declared.join() !== supplied.join()) {
    throw new EditionValidationError(
      `${path}.properties`,
      `must supply exactly ${declared.join(', ')} for slot "${slotId}"`,
    );
  }
  return { slotId, treatmentId: id(source['treatmentId'], `${path}.treatmentId`), properties };
}

function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value)) {
      deepFreeze(inner);
    }
  }
  return value;
}

/** Validates one activity's art record and registers it as validated. Exported for focused tests. */
export function parseActivityArt(value: unknown, path = 'art'): ActivityArtContent {
  const source = object(value, path);
  exactKeys(source, ['assetPath', 'viewBox', 'slots', 'eligibleSlotTreatments'], path);

  const assetPath = relativePath(source['assetPath'], `${path}.assetPath`);
  if (!assetPath.endsWith('.svg')) {
    throw new EditionValidationError(`${path}.assetPath`, 'expected an .svg asset');
  }
  const viewBox = string(source['viewBox'], `${path}.viewBox`);
  const box = VIEW_BOX.exec(viewBox);
  if (!box || box[1] !== box[2] || Number(box[1]) <= 0) {
    throw new EditionValidationError(`${path}.viewBox`, `"${viewBox}" is not a square "0 0 N N"`);
  }

  const slots = array(source['slots'], `${path}.slots`, 1).map((slot, index) =>
    parseSlot(slot, `${path}.slots[${index}]`),
  );
  unique(
    slots.map((slot) => slot.id),
    `${path}.slots`,
    'slot ID',
  );
  unique(
    slots.flatMap((slot) => slot.groups),
    `${path}.slots`,
    'group',
  );
  unique(
    slots.flatMap((slot) => Object.keys(slot.defaults)),
    `${path}.slots`,
    'variable',
  );

  const bySlot = new Map(slots.map((slot) => [slot.id, slot]));
  const treatments = array(
    source['eligibleSlotTreatments'],
    `${path}.eligibleSlotTreatments`,
    2,
  ).map((treatment, index) =>
    parseTreatment(treatment, `${path}.eligibleSlotTreatments[${index}]`, bySlot),
  );
  unique(
    treatments.map((treatment) => treatment.slotId),
    `${path}.eligibleSlotTreatments`,
    'eligible slot',
  );
  unique(
    treatments.map((treatment) => treatment.treatmentId),
    `${path}.eligibleSlotTreatments`,
    'treatment ID',
  );

  const art: ActivityArtContent = deepFreeze({
    assetPath,
    viewBox,
    slots,
    eligibleSlotTreatments: treatments,
  });
  validatedArt.add(art);
  return art;
}

function parseChild(value: unknown, path: string): ChildContent {
  const source = object(value, path);
  exactKeys(source, ['id', 'name'], path);
  const childId = string(source['id'], `${path}.id`);
  if (!CHILD_IDS.includes(childId)) {
    throw new EditionValidationError(`${path}.id`, `"${childId}" is not a known child`);
  }
  return { id: childId as ChildId, name: string(source['name'], `${path}.name`) };
}

function parseCutoff(value: unknown): EditionContent['cutoff'] {
  const source = object(value, 'cutoff');
  exactKeys(source, ['localDateTime', 'timeZone'], 'cutoff');
  const localDateTime = string(source['localDateTime'], 'cutoff.localDateTime');
  if (!LOCAL_DATE_TIME.test(localDateTime)) {
    throw new EditionValidationError('cutoff.localDateTime', 'expected YYYY-MM-DDTHH:mm');
  }
  const timeZone = string(source['timeZone'], 'cutoff.timeZone');
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
  } catch {
    throw new EditionValidationError('cutoff.timeZone', `"${timeZone}" is not a time zone`);
  }
  return { localDateTime, timeZone };
}

function parseTheme(value: unknown, path: string, children: readonly ChildContent[]): ThemeContent {
  const source = object(value, path);
  exactKeys(source, ['id', 'name', 'child', 'hue', 'art'], path);
  const child = string(source['child'], `${path}.child`);
  if (!children.some((candidate) => candidate.id === child)) {
    throw new EditionValidationError(`${path}.child`, `"${child}" is not a declared child`);
  }
  const hue = source['hue'];
  if (typeof hue !== 'number' || !Number.isFinite(hue) || hue < 0 || hue >= 360) {
    throw new EditionValidationError(`${path}.hue`, 'expected a number from 0 to under 360');
  }
  return {
    id: id(source['id'], `${path}.id`),
    name: string(source['name'], `${path}.name`),
    child: child as ChildId,
    hue,
    art: parseActivityArt(source['art'], `${path}.art`),
  };
}

/**
 * Validates parsed `edition.json` content (typed `unknown` at the boundary) and returns an
 * immutable `EditionContent`. Anything that breaks the generic contract throws an
 * `EditionValidationError`; the caller never sees a partly valid edition (R35).
 */
export function parseEdition(raw: unknown): EditionContent {
  const source = object(raw, 'edition');
  exactKeys(source, ['schemaVersion', 'cutoff', 'children', 'brand', 'copy', 'themes'], 'edition');
  if (source['schemaVersion'] !== 1) {
    throw new EditionValidationError('schemaVersion', 'unsupported schema version');
  }

  const children = array(source['children'], 'children', 1).map((child, index) =>
    parseChild(child, `children[${index}]`),
  );
  unique(
    children.map((child) => child.id),
    'children',
    'child',
  );

  const brandSource = object(source['brand'], 'brand');
  exactKeys(brandSource, ['mark', 'gameTitle', 'logo'], 'brand');
  const copySource = object(source['copy'], 'copy');
  exactKeys(copySource, ['birthdayHeadline'], 'copy');

  const themes = array(source['themes'], 'themes', 1).map((theme, index) =>
    parseTheme(theme, `themes[${index}]`, children),
  );
  unique(
    themes.map((theme) => theme.id),
    'themes',
    'theme ID',
  );
  unique(
    themes.map((theme) => theme.art.assetPath),
    'themes',
    'asset path',
  );

  return deepFreeze({
    schemaVersion: 1,
    cutoff: parseCutoff(source['cutoff']),
    children,
    themes,
    brand: {
      mark: string(brandSource['mark'], 'brand.mark'),
      gameTitle: string(brandSource['gameTitle'], 'brand.gameTitle'),
      logo: relativePath(brandSource['logo'], 'brand.logo'),
    },
    copy: { birthdayHeadline: string(copySource['birthdayHeadline'], 'copy.birthdayHeadline') },
  } satisfies EditionContent);
}
