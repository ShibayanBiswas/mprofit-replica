// The shipped default is an empty tenant: no families, no portfolios, no holdings.
// Set MPROFIT_SEED=demo to load the Azeez fixture instead (used for side-by-side parity runs
// against cloud.mprofit.in). Reference data below — asset classes, indices, catalogues — is
// product metadata, not client data, and is always present.
const DB = '54db4e5354537b2e';
const DEMO = process.env.MPROFIT_SEED === 'demo';

const demoFamilies = [
  { id: '95d3987b84b6a24e', dbId: DB, name: 'Azeez Family' },
];

const demoPortfolios = [
  { id: 'grp-azeez', familyId: '95d3987b84b6a24e', shortName: 'Family Group', fullName: 'Azeez Family Group', pan: '', type: 'Investment', isGroup: true, isTrading: false, isPms: false },
  { id: 'd4e9258bd8ba736d', familyId: '95d3987b84b6a24e', shortName: 'AFT', fullName: 'Azeez Family Trust', pan: 'AAATA1234F', type: 'Investment', isGroup: false, isTrading: false, isPms: false },
  { id: '7da9e36b35b84725', familyId: '95d3987b84b6a24e', shortName: 'Azeez Abdul', fullName: 'Azeez Abdul Kareem', pan: 'ABCPA1234K', type: 'Investment', isGroup: false, isTrading: false, isPms: false },
  { id: 'p-feroze', familyId: '95d3987b84b6a24e', shortName: 'Feroze Azeez', fullName: 'Feroze Azeez', pan: 'ABCPF5678A', type: 'Investment', isGroup: false, isTrading: false, isPms: false },
  { id: 'p-ruksana', familyId: '95d3987b84b6a24e', shortName: 'Ruksana Azeez', fullName: 'Ruksana Azeez', pan: 'ABCPR9012B', type: 'Investment', isGroup: false, isTrading: false, isPms: false },
  { id: 'p-sana', familyId: '95d3987b84b6a24e', shortName: 'Sana Azeez', fullName: 'Sana Azeez', pan: 'ABCPS3456C', type: 'Investment', isGroup: false, isTrading: false, isPms: false },
];

export const assetClasses = [
  { code: 'EQ', badge: 'EQ', label: 'Stocks & ETFs', mode: 'INV' },
  { code: 'MFEQ', badge: 'MF', label: 'Mutual Funds (Equity)', mode: 'INV' },
  { code: 'MFDT', badge: 'MF', label: 'Mutual Funds (Debt)', mode: 'INV' },
  { code: 'SIF', badge: 'SIF', label: 'SIF', mode: 'INV' },
  { code: 'BNK', badge: 'BNK', label: 'Banks', mode: 'INV' },
  { code: 'ULP', badge: 'ULP', label: 'NPS / ULIP', mode: 'INV' },
  { code: 'INS', badge: 'INS', label: 'Insurance', mode: 'INV' },
  { code: 'PE', badge: 'PE', label: 'Private Equity', mode: 'INV' },
  { code: 'FD', badge: 'FD', label: 'FDs', mode: 'INV' },
  { code: 'BND', badge: 'BND', label: 'Traded Bonds', mode: 'INV' },
  { code: 'NCD', badge: 'NCD', label: 'NCD/Debentures', mode: 'INV' },
  { code: 'CD', badge: 'CD', label: 'Deposits/Loans', mode: 'INV' },
  { code: 'PPF', badge: 'PPF', label: 'PPF/EPF', mode: 'INV' },
  { code: 'PO', badge: 'PO', label: 'Post Office', mode: 'INV' },
  { code: 'GLD', badge: 'GLD', label: 'Gold', mode: 'INV' },
  { code: 'SLV', badge: 'SLV', label: 'Silver', mode: 'INV' },
  { code: 'JWL', badge: 'JWL', label: 'Jewellery', mode: 'INV' },
  { code: 'PR', badge: 'PR', label: 'Property', mode: 'INV' },
  { code: 'ART', badge: 'ART', label: 'Art', mode: 'INV' },
  { code: 'AIF', badge: 'AIF', label: 'AIF', mode: 'INV' },
  { code: 'LN', badge: 'LN', label: 'Loans', mode: 'INV' },
  { code: 'SFO', badge: 'S', label: 'Stock F&O', mode: 'FO' },
  { code: 'OFO', badge: 'OT', label: 'Other F&O', mode: 'FO' },
];

// Illustrative demo holdings so the table + Analytics have something to render under MPROFIT_SEED=demo.
// Empty for AFT, which matches the live capture.
const h = (id, assetClassCode, name, qty, avgPrice, currentPrice, prevClose) => {
  const amtInvested = qty * avgPrice;
  const currentValue = qty * currentPrice;
  const todaysGain = qty * (currentPrice - prevClose);
  return {
    id, assetClassCode, name, qty, avgPrice,
    amtInvested: round2(amtInvested), currentPrice,
    todaysGain: round2(todaysGain), todaysGainPct: round2((todaysGain / (qty * prevClose)) * 100),
    unrealisedGain: round2(currentValue - amtInvested), unrealisedGainPct: round2(((currentValue - amtInvested) / amtInvested) * 100),
    currentValue: round2(currentValue),
  };
};
const round2 = (n) => Math.round(n * 100) / 100;

const demoHoldings = {
  'd4e9258bd8ba736d': [],
  '7da9e36b35b84725': [
    h('h1', 'EQ', 'Reliance Industries Ltd', 120, 2410.5, 2962.4, 2948.1),
    h('h2', 'EQ', 'HDFC Bank Ltd', 200, 1520.0, 1688.25, 1701.3),
    h('h3', 'EQ', 'Infosys Ltd', 150, 1390.0, 1510.6, 1496.0),
    h('h4', 'EQ', 'Nippon India ETF Nifty BeES', 400, 218.4, 256.9, 255.7),
    h('h5', 'MFEQ', 'Parag Parikh Flexi Cap Fund - Direct Growth', 3200.415, 62.1, 81.44, 81.02),
    h('h6', 'MFEQ', 'Mirae Asset Large Cap Fund - Direct Growth', 1800.0, 92.3, 112.87, 112.4),
    h('h7', 'MFDT', 'HDFC Corporate Bond Fund - Direct Growth', 5000.0, 27.4, 31.92, 31.9),
    h('h8', 'BND', '7.26% GOI 2033', 50, 1002.0, 1018.5, 1017.9),
    h('h9', 'GLD', 'Sovereign Gold Bond 2.50% 2028 Sr-IV', 40, 4791.0, 7215.0, 7190.0),
  ],
  'p-feroze': [
    h('h10', 'EQ', 'Tata Consultancy Services Ltd', 80, 3320.0, 3890.5, 3910.0),
    h('h11', 'EQ', 'ICICI Bank Ltd', 300, 890.0, 1245.6, 1238.0),
    h('h12', 'EQ', 'Larsen & Toubro Ltd', 60, 2150.0, 3520.0, 3498.0),
    h('h13', 'MFEQ', 'Axis Small Cap Fund - Direct Growth', 2500.0, 78.0, 104.2, 103.5),
    h('h14', 'MFEQ', 'Kotak Emerging Equity Fund - Direct Growth', 1200.0, 84.5, 131.6, 131.0),
    h('h15', 'MFDT', 'ICICI Pru Liquid Fund - Direct Growth', 300.0, 340.0, 372.15, 372.1),
    h('h16', 'FD', 'HDFC Bank FD 7.1% (Mat 12-Mar-2027)', 1, 500000, 531200, 531100),
  ],
  'p-ruksana': [
    h('h17', 'EQ', 'Asian Paints Ltd', 100, 2810.0, 2455.0, 2470.0),
    h('h18', 'EQ', 'Titan Company Ltd', 90, 2410.0, 3312.0, 3290.0),
    h('h19', 'MFEQ', 'SBI Bluechip Fund - Direct Growth', 4000.0, 58.2, 84.6, 84.3),
    h('h20', 'GLD', 'Gold Coins 24K', 120, 5100.0, 7350.0, 7320.0),
    h('h21', 'PPF', 'PPF - SBI', 1, 1450000, 1612300, 1612300),
  ],
  'p-sana': [
    h('h22', 'EQ', 'Zomato Ltd', 800, 118.0, 248.5, 245.0),
    h('h23', 'EQ', 'Tata Motors Ltd', 150, 640.0, 980.2, 990.0),
    h('h24', 'MFEQ', 'Quant Small Cap Fund - Direct Growth', 3100.0, 145.0, 236.4, 234.0),
    h('h25', 'MFDT', 'Axis Banking & PSU Debt Fund - Direct Growth', 1100.0, 2205.0, 2418.0, 2417.6),
  ],
};

export const families = DEMO ? demoFamilies : [];
export const portfolios = DEMO ? demoPortfolios : [];
export const holdings = DEMO ? demoHoldings : {};

export const indices = [
  { code: 'SENSEX', name: 'Sensex', value: 74320.3, change: 316.48, changePct: 0.43 },
  { code: 'NIFTY', name: 'Nifty', value: 23221.5, change: 102.9, changePct: 0.45 },
];

// Analytics "Today's Performance" strip + sidebar index card (live shows these five by default).
export const analyticsIndices = [
  { code: 'SENSEX', name: 'BSE Sensex', value: 74294.96, change: -19.63, changePct: -0.03 },
  { code: 'NIFTY', name: 'Nifty 50', value: 23346.4, change: 75.8, changePct: 0.33 },
  { code: 'NIFTYMID100', name: 'Nifty Midcap 100', value: 52840.15, change: 647.1, changePct: 1.24 },
  { code: 'NIFTYSML100', name: 'Nifty Smallcap 100', value: 16412.6, change: 280.7, changePct: 1.74 },
  { code: 'NIFTY500', name: 'Nifty 500', value: 21388.9, change: 173.9, changePct: 0.82 },
];

export const benchmarks = [
  { code: 'NIFTY50TRI', name: 'TRI Nifty 50', cagr: 12.84 },
  { code: 'SENSEXTRI', name: 'TRI BSE Sensex', cagr: 12.31 },
  { code: 'NIFTY500TRI', name: 'TRI Nifty 500', cagr: 13.62 },
  { code: 'NIFTYMIDTRI', name: 'TRI Nifty Midcap 150', cagr: 17.9 },
];

// Watchlist (per user in live; single list here). Starts empty on a new account.
export const watchlist = DEMO ? [
  { id: 'w1', name: 'Reliance Industries', price: 1226.4, change: -17.5, changePct: -1.41 },
  { id: 'w2', name: 'Tata Consultancy Services', price: 2105.0, change: -85.0, changePct: -3.88 },
  { id: 'w3', name: 'HDFC Bank', price: 731.0, change: 18.0, changePct: 2.52 },
  { id: 'w4', name: 'ICICI Bank', price: 1338.9, change: -8.7, changePct: -0.65 },
  { id: 'w5', name: 'Hindustan Unilever', price: 1932.0, change: -10.2, changePct: -0.53 },
] : [];

// Category (live "View by Category") for each asset class code.
export const categoryOf = {
  EQ: 'Stocks', MFEQ: 'Mutual Funds', MFDT: 'Mutual Funds', SIF: 'Mutual Funds', BNK: 'Banks', ULP: 'NPS / ULIP', INS: 'Insurance',
  PE: 'Private Equity', FD: 'FDs', BND: 'Bonds', NCD: 'Bonds', CD: 'Deposits', PPF: 'PPF / EPF', PO: 'Post Office', GLD: 'Gold',
  SLV: 'Silver', JWL: 'Jewellery', PR: 'Property', ART: 'Art', AIF: 'AIF', LN: 'Loans', SFO: 'F&O', OFO: 'F&O',
};

// Full index catalogue offered by the live "Select Indices" / "Select Index" dialogs (market reference data).
export const indexCatalog = [
  'TRI Nifty 500', 'TRI Nifty 50', 'TRI NIFTY Midcap 150', 'TRI NIFTY Smallcap 250', 'BSE Sensex', 'CRISIL Liquid Debt Index', 'CRISIL Composite Bond Index',
  'Nifty 50', 'BSE 500', 'BSE 100 ESG Index', 'BSE 150 Midcap Index', 'BSE 250 LargeMidCap Index', 'BSE 250 SmallCap Index', 'BSE 400 MidSmallCap Index',
  'BSE Allcap Index', 'BSE Auto', 'BSE BANKEX', 'BSE Bharat 22 Index', 'BSE Capital Goods', 'BSE CARBONEX', 'BSE Consumer Durables', 'BSE CPSE',
  'BSE Dividend Stability Index', 'BSE Dollex 30', 'BSE Dollex 100', 'BSE Energy', 'BSE Enhanced Value Index', 'BSE FMCG Sector', 'BSE Greenex',
  'BSE Industrials', 'BSE IPO', 'BSE Largecap', 'BSE Metal', 'BSE Midcap', 'BSE Momentum Index', 'BSE Oil&Gas', 'BSE Power', 'BSE PSU', 'BSE Realty Index',
  'BSE SENSEX 50 Index', 'BSE SENSEX Next 50', 'BSE Smallcap', 'BSE SME IPO', 'BSE Tech', 'BSE Telecom', 'BSE Utilities', 'Nifty 100', 'Nifty 200', 'Nifty 500',
  'Nifty 100 Equal Weight', 'Nifty 100 Liquid 15', 'Nifty 100 Low Volatility 30', 'Nifty 200 Quality 30', 'Nifty 50 Value 20', 'Nifty Alpha 50', 'Nifty Auto',
  'Nifty Bank', 'Nifty Commodities', 'Nifty Consumption', 'Nifty Dividend Opportunities 50', 'Nifty Energy', 'Nifty Financial Services', 'Nifty FMCG',
  'Nifty Growth Sectors 15', 'Nifty India Manufacturing', 'Nifty Infrastructure', 'Nifty IT', 'Nifty LargeMidcap 250', 'Nifty Media', 'Nifty Metal',
  'Nifty Midcap 50', 'Nifty Midcap 100', 'Nifty Midcap 150', 'Nifty MidSmallcap 400', 'Nifty MNC', 'Nifty Next 50', 'Nifty Oil & Gas', 'Nifty Pharma',
  'Nifty PSU Bank', 'Nifty Realty', 'Nifty Services Sector', 'Nifty Smallcap 50', 'Nifty Smallcap 100', 'Nifty Smallcap 250', 'S&P BSE 100', 'S&P BSE 200',
  'S&P BSE Dollex 200', 'S&P BSE Healthcare',
].map((name, i) => ({ code: name.toUpperCase().replace(/[^A-Z0-9]+/g, '_'), name, order: i }));

// Default "Select Indices" selection (matches the live default of 5).
export const defaultSelectedIndices = ['TRI Nifty 50', 'BSE Sensex', 'Nifty 50', 'Nifty Midcap 100', 'Nifty Smallcap 100'];

// Benchmark Settings (wrench → Benchmark Settings): category-wise and portfolio-wise overrides.
export const benchmarkSettings = {
  defaultBenchmark: 'TRI Nifty 50',
  categories: [
    { name: 'Cash', benchmark: null },
    { name: 'Debt', benchmark: 'CRISIL Composite Bond Index' },
    { name: 'Equity', benchmark: 'TRI Nifty 50' },
    { name: 'Gold+', benchmark: null },
    { name: 'International', benchmark: null },
  ],
};

// wrench → Custom Categories: default product → category / sub-category mapping (mirrors the live "By Asset Class" accordions).
const cc = (assetClass, product, category, subCategory) => ({ id: `${assetClass}|${product}`.toLowerCase().replace(/[^a-z0-9|]+/g, '-'), assetClass, product, category, subCategory, isDefault: true });
export const customCategoryRows = [
  cc('Stocks & ETFs', 'Other Stocks', 'Other', 'Other Stocks'),
  cc('Stocks & ETFs', 'Gold & Silver ETFs', 'Gold+', 'Gold & Silver ETFs'),
  cc('Stocks & ETFs', 'International ETFs', 'International', 'International ETFs'),
  cc('Stocks & ETFs', 'Debt ETFs', 'Debt', 'Debt ETFs'),
  cc('Stocks & ETFs', 'REITs', 'Real Estate', 'REITs'),
  cc('Mutual Funds', 'Real Estate Funds', 'Real Estate', 'Real Estate Funds'),
  cc('Mutual Funds', 'Equity Funds', 'Equity', 'Equity Funds'),
  cc('Mutual Funds', 'Solution Oriented Funds', 'Retirement', 'Solution Oriented Funds'),
  cc('Mutual Funds', 'Debt Funds', 'Debt', 'Debt Funds'),
  cc('Mutual Funds', 'Gold & Silver Funds', 'Gold+', 'Gold & Silver Funds'),
  cc('SIF', 'Equity SIF', 'Equity', 'Equity SIF'),
  cc('SIF', 'Debt SIF', 'Debt', 'Debt SIF'),
  cc('SIF', 'Other SIF', 'Other', 'Other SIF'),
  cc('Traded Bonds', 'Listed Bonds', 'Debt', 'Listed Bonds'),
  cc('Traded Bonds', 'Sovereign Gold Bonds', 'Gold+', 'Sovereign Gold Bonds'),
  cc('NCD', 'NCDs', 'Debt', 'NCDs'),
  cc('AIF', 'AIFs', 'Other', 'AIFs'),
  cc('Private Equity', 'Private Equity', 'Equity', 'Private Equity'),
  cc('FD', 'FD', 'Debt', 'FD'),
  cc('Banks', 'Banks', 'Cash', 'Banks'),
  cc('Property', 'Property', 'Real Estate', 'Property'),
  cc('Gold', 'Gold', 'Gold+', 'Gold'),
  cc('Silver', 'Silver', 'Gold+', 'Silver'),
  cc('Insurance', 'Insurance', 'Retirement', 'Insurance'),
  cc('NPS / ULIP', 'NPS/ULIP', 'Retirement', 'NPS/ULIP'),
  cc('PPF', 'PPF', 'Debt', 'PPF'),
  cc('Deposits', 'Deposits', 'Debt', 'Deposits'),
  cc('Post Office', 'Post Office', 'Debt', 'Post Office'),
  cc('Jewellery', 'Jewellery', 'Gold+', 'Jewellery'),
  cc('Art', 'Art', 'Other', 'Art'),
  cc('PMS', 'PMS', 'Equity', 'PMS'),
];
// Category Master: categories in the live order with their sub-categories (Equity additionally lists "Stocks & Equity ETFs").
export const categoryMaster = ['Cash', 'Debt', 'Equity', 'Gold+', 'International', 'Other', 'Real Estate', 'Retirement'].map((name) => ({
  name,
  isDefault: true,
  subCategories: [...new Set([...customCategoryRows.filter((r) => r.category === name).map((r) => r.subCategory), ...(name === 'Equity' ? ['Stocks & Equity ETFs'] : [])])].sort().map((s) => ({ name: s, isDefault: true })),
}));

// Report Studio "Popular views" (view = saved report definition; chip = report kind + level).
export const reportStudioViews = [
  { id: 'rv1', name: 'Advisor-wise Holdings', kind: 'Holdings', level: 'Family' },
  { id: 'rv2', name: 'Advisor-wise Performance Review', kind: 'Performance', level: 'Family' },
  { id: 'rv3', name: 'Advisor-wise Performance Snapshot', kind: 'Performance', level: 'Family' },
  { id: 'rv4', name: 'Entity Holdings', kind: 'Holdings', level: 'Entity' },
  { id: 'rv5', name: 'Entity Performance Review', kind: 'Performance', level: 'Entity' },
  { id: 'rv6', name: 'Entity-wise Performance Snapshot', kind: 'Performance', level: 'Family' },
  { id: 'rv7', name: 'FY-wise Holdings', kind: 'Holdings: Multi Period', level: 'Family' },
  { id: 'rv8', name: 'FY-wise Performance View', kind: 'Performance: Multi Period', level: 'Family' },
  { id: 'rv9', name: 'Family Top 10 Holdings', kind: 'Holdings', level: 'Family' },
  { id: 'rv10', name: 'Family-level Holdings', kind: 'Holdings', level: 'Family' },
  { id: 'rv11', name: 'Global Asset Holdings', kind: 'Holdings', level: 'Global' },
  { id: 'rv12', name: 'Portfolio Performance Review', kind: 'Performance', level: 'Portfolio' },
  { id: 'rv13', name: 'Portfolio-wise Holdings', kind: 'Holdings', level: 'Family' },
  { id: 'rv14', name: 'Portfolio-wise Performance Snapshot', kind: 'Performance', level: 'Family' },
  { id: 'rv15', name: 'Sector-wise Stockholdings', kind: 'Holdings', level: 'Family' },
];
