import type { UIScreen } from './uiSchema';

/**
 * Turn the (possibly truncated) JSON text Claude has streamed so far into the
 * largest valid UIScreen it contains — so the renderer can paint while the model
 * is still writing.
 *
 * Granularity is "whole values only": a title, a section field or a complete
 * element appears the moment its closing token has arrived; half-typed strings
 * and half-typed numbers never reach Blade (no "₹12" flashing to "₹1,250").
 *
 * Nesting is fixed by the schema (non-recursive):
 *   1 screen {  2 sections [  3 section {  4 elements [  5 element {
 * so a "safe cut" is any place where everything before it is a finished unit
 * at depth ≤ 4: just before a `,` that ends a property/item, or right after the
 * `}` that closes a section or element. We cut there, close whatever is still
 * open, and JSON.parse — stateless, O(n) on a ~2 KB string per chunk.
 */
export const parsePartialScreen = (text: string): UIScreen | null => {
  const open: string[] = []; // closers for the containers currently open, innermost last
  let inString = false;
  let escaped = false;
  let cutAt = -1;
  let cutCloser = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') open.push('}');
    else if (ch === '[') open.push(']');
    else if (ch === '}' || ch === ']') {
      const depthBefore = open.length;
      open.pop();
      // An element (5) or a whole section (3) just finished.
      if (ch === '}' && (depthBefore === 5 || depthBefore === 3)) {
        cutAt = i + 1;
        cutCloser = [...open].reverse().join('');
      }
    } else if (ch === ',' && open.length <= 4) {
      // The value before this comma is complete; cut just before it.
      cutAt = i;
      cutCloser = [...open].reverse().join('');
    }
  }

  if (cutAt < 0) return null;
  let screen: Partial<UIScreen>;
  try {
    screen = JSON.parse(text.slice(0, cutAt) + cutCloser);
  } catch {
    return null;
  }
  if (typeof screen.title !== 'string') return null;

  // A section with no finished element yet would render as an empty card.
  const sections = (screen.sections ?? [])
    .map((s) => ({ ...s, elements: s.elements ?? [] }))
    .filter((s) => s.elements.length > 0);
  return { ...screen, title: screen.title, sections };
};
