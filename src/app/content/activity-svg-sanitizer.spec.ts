import {
  ActivitySvgError,
  ActivitySvgRejection,
  sanitizeActivitySvg,
} from './activity-svg-sanitizer';
import { parseActivityArt } from './edition-parser';

/** A small, valid structured activity: one fixed group, a one-variable slot and a two-variable slot. */
const ART = parseActivityArt({
  assetPath: 'content/test/hostile.svg',
  viewBox: '0 0 200 200',
  slots: [
    { id: 'hat', groups: ['hat'], defaults: { '--hat': '#112233' } },
    {
      id: 'coat',
      groups: ['coat-1', 'coat-2'],
      defaults: { '--coat': '#445566', '--coat-2': '#778899' },
    },
  ],
  eligibleSlotTreatments: [
    { slotId: 'hat', treatmentId: 'hat-red', properties: { '--hat': '#ff0000' } },
    {
      slotId: 'coat',
      treatmentId: 'coat-blue',
      properties: { '--coat': '#0000ff', '--coat-2': '#00ffff' },
    },
  ],
});

const NS = 'xmlns="http://www.w3.org/2000/svg"';
const BODY = `
  <g id="body" data-group="non-variant" data-part="body">
    <g transform="translate(100,100) rotate(0)">
      <circle cx="0" cy="0" r="40" fill="#f5cfb3" stroke="#3b2a22" stroke-width="2.5" />
    </g>
  </g>`;
const HAT = `
  <g id="hat" data-group="variant" data-slot="hat">
    <rect x="10" y="10" width="40" height="20" rx="4" style="fill:var(--hat,#112233)" />
  </g>`;
const COAT = `
  <g id="coat-1" data-group="variant" data-slot="coat">
    <polyline points="1,2 3,4" fill="none" stroke-width="9" style="stroke:var(--coat,#445566)" />
  </g>
  <g id="coat-2" data-group="variant" data-slot="coat">
    <circle cx="5" cy="6" r="3" style="fill:var(--coat-2,#778899)" />
  </g>`;

function svg(inner = BODY + HAT + COAT, rootAttributes = ''): string {
  return `<svg ${NS} viewBox="0 0 200 200" data-owner="T" data-activity="Test" ${rootAttributes}>
  <!-- layers back to front -->${inner}
</svg>`;
}

function rejection(source: string): ActivitySvgRejection {
  try {
    sanitizeActivitySvg(source, ART);
  } catch (error) {
    expect(error).toBeInstanceOf(ActivitySvgError);
    return (error as ActivitySvgError).reason;
  }
  throw new Error('Expected the SVG to be rejected');
}

describe('sanitizeActivitySvg (R27, R28, AC8)', () => {
  describe('accepted input', () => {
    it('keeps the structure, paint order, data hooks and variable fills', () => {
      const out = sanitizeActivitySvg(svg(), ART);
      expect(out.startsWith('<svg')).toBe(true);
      expect(out).toContain('viewBox="0 0 200 200"');
      const order = [...out.matchAll(/data-slot="([a-z]+)"|data-part="([a-z]+)"/g)].map(
        (match) => match[1] ?? match[2],
      );
      expect(order).toEqual(['body', 'hat', 'coat', 'coat']);
      expect(out).toContain('style="fill:var(--hat,#112233)"');
      expect(out).toContain('style="stroke:var(--coat,#445566)"');
      expect(out).toContain('style="fill:var(--coat-2,#778899)"');
      expect(out).toContain('transform="translate(100,100) rotate(0)"');
    });

    it('hides the art from assistive technology and drops comments and group IDs', () => {
      const out = sanitizeActivitySvg(svg(), ART);
      expect(out).toContain('aria-hidden="true"');
      expect(out).toContain('focusable="false"');
      expect(out).not.toContain('<!--');
      expect(out).not.toContain('id="');
    });

    it('is produced by an allow-list rebuild, not a pass-through of the source', () => {
      const out = sanitizeActivitySvg(svg(), ART);
      expect(out).not.toContain('layers back to front');
      expect(out).not.toMatch(/\n/);
    });
  });

  describe('active content', () => {
    it('rejects script elements, at any depth', () => {
      expect(rejection(svg(BODY + HAT + COAT + '<script>alert(1)</script>'))).toBe('script');
      expect(
        rejection(
          svg(BODY.replace('</g>\n  </g>', '<script>x()</script></g>\n  </g>') + HAT + COAT),
        ),
      ).toBe('script');
    });

    it('rejects foreignObject', () => {
      expect(
        rejection(
          svg(BODY + HAT + COAT + '<g id="x" data-group="non-variant"><foreignObject/></g>'),
        ),
      ).toBe('foreign-object');
    });

    it('rejects embedded content', () => {
      for (const tag of ['iframe', 'object', 'embed', 'image', 'img', 'video', 'audio']) {
        expect(rejection(svg(BODY + HAT + COAT + `<${tag}/>`)), tag).toBe('embedded-content');
      }
    });

    it('rejects use and link elements as external references', () => {
      expect(rejection(svg(BODY + HAT + COAT + '<use/>'))).toBe('external-reference');
      expect(rejection(svg(BODY + HAT + COAT + '<a/>'))).toBe('external-reference');
    });

    it('rejects animation elements', () => {
      for (const tag of ['animate', 'animateTransform', 'animateMotion', 'set']) {
        expect(rejection(svg(BODY + HAT + COAT + `<${tag}/>`)), tag).toBe('animation');
      }
    });

    it('rejects style elements and metadata', () => {
      expect(rejection(svg(BODY + HAT + COAT + '<style>g{fill:red}</style>'))).toBe(
        'style-element',
      );
      expect(rejection(svg(BODY + HAT + COAT + '<metadata>x</metadata>'))).toBe('metadata');
    });

    it('rejects event-handler attributes on the root, groups and shapes', () => {
      expect(rejection(svg(undefined, 'onload="alert(1)"'))).toBe('event-attribute');
      expect(
        rejection(svg(HAT.replace('<g id="hat"', '<g onclick="x()" id="hat"') + BODY + COAT)),
      ).toBe('event-attribute');
      expect(rejection(svg(BODY + HAT.replace('<rect ', '<rect onmouseover="x()" ') + COAT))).toBe(
        'event-attribute',
      );
    });
  });

  describe('external references and unsafe CSS', () => {
    it('rejects href and xlink:href attributes', () => {
      const xlink = 'xmlns:xlink="http://www.w3.org/1999/xlink"';
      expect(
        rejection(
          svg(BODY + HAT.replace('<rect ', `<rect ${xlink} xlink:href="http://evil/x" `) + COAT),
        ),
      ).toBe('external-reference');
      expect(
        rejection(svg(BODY + HAT.replace('<rect ', '<rect href="http://evil/x" ') + COAT)),
      ).toBe('external-reference');
    });

    it('rejects url() paint and remote or data URLs in any attribute value', () => {
      expect(
        rejection(
          svg(BODY.replace('fill="#f5cfb3"', 'fill="url(http://evil/p.svg#a)"') + HAT + COAT),
        ),
      ).toBe('external-reference');
      expect(
        rejection(svg(BODY.replace('fill="#f5cfb3"', 'fill="url(#local)"') + HAT + COAT)),
      ).toBe('external-reference');
      expect(
        rejection(
          svg(BODY + HAT + COAT, 'data-owner="https://evil.example/"').replace(
            'data-owner="T"',
            '',
          ),
        ),
      ).toBe('external-reference');
    });

    it('rejects inline CSS that is not a single declared-variable fill or stroke', () => {
      const hostile = [
        'fill:url(http://evil/x)',
        'fill:red',
        'fill:var(--hat,#112233);background:url(http://evil/x)',
        'fill:var(--hat,#112233);stroke:red',
        'fill:var(--hat,url(http://evil/x))',
        'behavior:url(x.htc)',
        'fill:expression(alert(1))',
        '@import url(http://evil/x.css)',
        'position:fixed;inset:0',
      ];
      for (const css of hostile) {
        expect(rejection(svg(BODY + HAT.replace('fill:var(--hat,#112233)', css) + COAT)), css).toBe(
          'unsafe-css',
        );
      }
    });

    it('rejects a style attribute on a group', () => {
      expect(
        rejection(svg(BODY + HAT.replace('<g id="hat"', '<g style="fill:red" id="hat"') + COAT)),
      ).toBe('unknown-attribute');
    });
  });

  describe('variables', () => {
    it('rejects a variable that no slot declares', () => {
      expect(
        rejection(svg(BODY + HAT.replace('var(--hat,#112233)', 'var(--evil,#112233)') + COAT)),
      ).toBe('undeclared-variable');
    });

    it("rejects another slot's variable inside a group", () => {
      expect(
        rejection(svg(BODY + HAT.replace('var(--hat,#112233)', 'var(--coat,#445566)') + COAT)),
      ).toBe('undeclared-variable');
    });

    it('rejects any variable in a non-variant group', () => {
      const fixed = BODY.replace('fill="#f5cfb3"', 'style="fill:var(--hat,#112233)"');
      expect(rejection(svg(fixed + HAT + COAT))).toBe('undeclared-variable');
    });
  });

  describe('malformed and mismatched documents', () => {
    it('rejects markup that is not well-formed XML', () => {
      expect(rejection(`<svg ${NS} viewBox="0 0 200 200"><g></svg>`)).toBe('parse-error');
      expect(rejection('not xml at all')).toBe('parse-error');
      expect(rejection('')).toBe('parse-error');
    });

    it('rejects DOCTYPE and entity declarations', () => {
      expect(rejection(`<!DOCTYPE svg [<!ENTITY x "y">]>${svg()}`)).toBe('doctype');
    });

    it('rejects a root that is not an SVG element', () => {
      expect(rejection('<div xmlns="http://www.w3.org/1999/xhtml"></div>')).toBe('not-svg-root');
      expect(rejection('<svg viewBox="0 0 200 200"></svg>')).toBe('not-svg-root');
    });

    it('rejects elements and attributes outside the allow-list', () => {
      expect(rejection(svg(BODY + HAT + COAT + '<text>hi</text>'))).toBe('unknown-element');
      expect(rejection(svg(BODY + HAT.replace('<rect ', '<rect class="x" ') + COAT))).toBe(
        'unknown-attribute',
      );
    });

    it('rejects text content and CDATA', () => {
      expect(rejection(svg(BODY + HAT + COAT + 'hello'))).toBe('unexpected-node');
      expect(rejection(svg(BODY + HAT + COAT + '<![CDATA[x]]>'))).toBe('unexpected-node');
    });

    it('rejects a viewBox that disagrees with the edition', () => {
      expect(rejection(svg().replace('viewBox="0 0 200 200"', 'viewBox="0 0 100 100"'))).toBe(
        'contract-mismatch',
      );
    });

    it('rejects a declared slot group that is missing', () => {
      expect(rejection(svg(BODY + COAT))).toBe('contract-mismatch');
    });

    it('rejects a variant group that no slot declares', () => {
      const extra =
        '<g id="extra" data-group="variant" data-slot="hat"><circle cx="1" cy="1" r="1"/></g>';
      expect(rejection(svg(BODY + HAT + COAT + extra))).toBe('contract-mismatch');
    });

    it('rejects an undeclared slot and a group listed under another slot', () => {
      expect(rejection(svg(BODY + HAT.replace('data-slot="hat"', 'data-slot="cape"') + COAT))).toBe(
        'contract-mismatch',
      );
      expect(rejection(svg(BODY + HAT.replace('data-slot="hat"', 'data-slot="coat"') + COAT))).toBe(
        'contract-mismatch',
      );
    });

    it('rejects a declared variable that is never used', () => {
      expect(
        rejection(svg(BODY + HAT + COAT.replace('var(--coat-2,#778899)', 'var(--coat,#445566)'))),
      ).toBe('contract-mismatch');
    });

    it('rejects a fallback color that is not the manifest default', () => {
      expect(rejection(svg(BODY + HAT.replace('#112233', '#ffffff') + COAT))).toBe(
        'contract-mismatch',
      );
    });

    it('rejects a variant group with no slot, and a non-variant group that names one', () => {
      expect(rejection(svg(BODY + HAT.replace(' data-slot="hat"', '') + COAT))).toBe(
        'contract-mismatch',
      );
      expect(rejection(svg(BODY.replace('data-part="body"', 'data-slot="hat"') + HAT + COAT))).toBe(
        'contract-mismatch',
      );
    });

    it('rejects a shape outside a paint-order group', () => {
      expect(rejection(svg(BODY + HAT + COAT + '<circle cx="1" cy="1" r="1"/>'))).toBe(
        'contract-mismatch',
      );
    });

    it('rejects out-of-range attribute values', () => {
      expect(rejection(svg(BODY.replace('r="40"', 'r="calc(1px)"') + HAT + COAT))).toBe(
        'invalid-attribute-value',
      );
      expect(
        rejection(svg(BODY + HAT + COAT.replace('points="1,2 3,4"', 'points="javascript"'))),
      ).toBe('invalid-attribute-value');
    });
  });
});
