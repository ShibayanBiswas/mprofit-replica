// The only business-facing constants allowed in the frontend (product exclusions / white-label contacts).

export const CONTACT_US = [
  { role: 'Product Manager', name: 'Hasya Patel', email: 'hasyapatel@rathi.com' },
  { role: 'Software Developer', name: 'Shibayan Biswas', email: 'shibayanbiswas@rathi.com' },
] as const;

export const AUTO_IMPORT_EMAIL = 'shibayanbiswas@rathi.com';

const host = typeof location !== 'undefined' ? location.hostname : '';
const local = host === 'localhost' || host === '127.0.0.1' || host === '';
export const CLASSIC_URL = local ? 'http://localhost:5173' : 'https://mprofit-classic-shibayan-biswas-projects.vercel.app';
export const ANALYTICS_URL = local ? 'http://localhost:5174' : 'https://mprofit-analytics-shibayan-biswas-projects.vercel.app';
