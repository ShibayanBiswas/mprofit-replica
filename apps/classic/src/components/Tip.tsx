// Small circular "?" / "i" helper badge seen throughout Classic.
export function Tip({ text, glyph = '?' }: { text: string; glyph?: '?' | 'i' }) {
  return <span className="tip" title={text} aria-label={text}>{glyph}</span>;
}
