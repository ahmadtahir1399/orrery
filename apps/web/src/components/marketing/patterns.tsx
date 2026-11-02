import type { CSSProperties, ReactNode } from 'react';
import { InView } from './in-view';

type CssVars = CSSProperties & Record<`--${string}`, string>;

/*
 * Decorative landing backgrounds. Everything here is aria-hidden, sits behind
 * content, and keeps a static end state under reduced motion.
 */

// Two slow beams, one per axis, on the landing's shared cadence: enough to
// feel alive without competing with the product.
const BEAMS = [
  { id: 'x1', axis: 'x', vars: { '--row': '1', '--dur': '18s', '--delay': '0s' } },
  { id: 'y7', axis: 'y', vars: { '--col': '7', '--dur': '24s', '--delay': '-9s' } },
] as const;

/** Hero grid with emerald beams travelling along lines that clear the headline. */
export function HeroGrid() {
  return (
    <InView live threshold={0} className="lp-live lp-hero-grid">
      {BEAMS.map((beam) => (
        <span
          key={beam.id}
          className="lp-beam"
          data-axis={beam.axis}
          style={beam.vars as CssVars}
        />
      ))}
    </InView>
  );
}

/** Soft dot field, masked toward the trailing side of a section. */
export function DotField() {
  return <div aria-hidden="true" className="lp-dots" />;
}

const OPEN = '([{<';
const CLOSE: Record<string, string> = { '(': ')', '[': ']', '{': '}', '<': '>' };

/**
 * Rows of nested bracket runs, like code folded to its punctuation. Built with
 * a fixed seed so server output is identical on every render.
 */
function buildGlyphRows(rows: number, cols: number): ReactNode[] {
  let seed = 20260917;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed;
  };
  const out: ReactNode[] = [];
  for (let row = 0; row < rows; row += 1) {
    let line = '';
    let column = 0;
    while (column < cols) {
      const depth = 2 + (next() % 5);
      const opens = Array.from({ length: depth }, () => OPEN[next() % OPEN.length] ?? '(');
      const run =
        opens.join('') +
        [...opens]
          .reverse()
          .map((glyph) => CLOSE[glyph])
          .join('');
      for (const glyph of run) {
        if (column >= cols) break;
        if (next() % 31 === 0) {
          if (line) out.push(line);
          line = '';
          out.push(
            <b key={`${row}-${column}`} style={{ '--tw': `${(next() % 52) / 10}s` } as CssVars}>
              {glyph}
            </b>
          );
        } else {
          line += glyph;
        }
        column += 1;
      }
    }
    out.push(`${line}\n`);
  }
  return out;
}

const GLYPH_ROWS = buildGlyphRows(22, 132);

export function GlyphField() {
  return (
    <div aria-hidden="true" className="lp-glyphs">
      {GLYPH_ROWS}
    </div>
  );
}

const MERIDIANS = [0, 1, 2, 3, 4, 5, 6, 7];
const PARALLELS = [
  { id: 'n60', vars: { '--s': '0.5', '--y': '-190px' } },
  { id: 'n30', vars: { '--s': '0.866', '--y': '-110px' } },
  { id: 'eq', vars: { '--s': '1', '--y': '0px' } },
  { id: 's30', vars: { '--s': '0.866', '--y': '110px' } },
  { id: 's60', vars: { '--s': '0.5', '--y': '190px' } },
];
const NODES = [
  { id: 'a', vars: { '--lon': '20deg', '--lat': '-24deg' } },
  { id: 'b', vars: { '--lon': '105deg', '--lat': '14deg' } },
  { id: 'c', vars: { '--lon': '200deg', '--lat': '-38deg' } },
  { id: 'd', vars: { '--lon': '285deg', '--lat': '28deg' } },
  { id: 'e', vars: { '--lon': '-58deg', '--lat': '6deg' } },
];

/** CSS 3D wireframe globe with an orbiting marker. */
export function WireGlobe() {
  return (
    <div aria-hidden="true" className="lp-globe-stage">
      <div className="lp-globe">
        <div className="lp-globe-spin">
          {MERIDIANS.map((index) => (
            <span
              key={index}
              className="lp-meridian"
              data-accent={index === 2 ? 'true' : undefined}
              style={{ '--i': String(index) } as CssVars}
            />
          ))}
          {PARALLELS.map((parallel) => (
            <span key={parallel.id} className="lp-parallel" style={parallel.vars as CssVars} />
          ))}
          {NODES.map((node) => (
            <span key={node.id} className="lp-node" style={node.vars as CssVars} />
          ))}
        </div>
        <span className="lp-globe-orbit" />
      </div>
    </div>
  );
}
