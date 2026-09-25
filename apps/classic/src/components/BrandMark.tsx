// Single swap point for white-label branding. Logo assets live in /public/assets/logos.
export function BrandMark({ variant }: { variant: 'login' | 'shell' }) {
  if (variant === 'login') return <img className="brand-login" src="/assets/logos/mprofit-white-green.svg" alt="" width={250} height={66} />;
  return <img className="brand-shell" src="/assets/logos/mprofit-white.svg" alt="" width={92} height={25} />;
}
