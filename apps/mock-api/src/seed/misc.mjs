// Misc fixtures: global reports, brokers, import templates, changelog, tasks, corporate actions, settings.

export const globalReports = {
  title: 'Global Reporting Workbook',
  description: 'Download an Excel workbook containing various global reports that provide detailed AUM insights across all your families.',
  sections: [
    { report: 'Global AUM', description: 'Global assets-under-management (AUM) report' },
    { report: 'Client-wise AUM', description: 'Portfolio-wise valuation report across all families' },
    { report: 'Asset Allocation', description: 'Asset allocation report with pie-chart representation' },
    { report: 'Portfolio Weightages', description: 'Asset-wise portfolio weightages report with percent breakdown' },
    { report: 'Top 5 Assets', description: 'Top 5 assets report by current value' },
    { report: 'Asset-wise Holding', description: 'Asset-wise holding report for all portfolios' },
    { report: 'Family-wise Holding', description: 'Family-wise holding report for all assets' },
    { report: 'Portfolio-wise Holding', description: 'Portfolio-wise holding report for all assets' },
    { report: 'Closing Balances', description: 'Portfolio-wise closing balances report for all assets' },
  ],
};

export const brokers = [
  { id: 'zerodha', name: 'Zerodha', kind: 'stocks' },
  { id: 'dhan', name: 'Dhan', kind: 'stocks' },
  { id: 'icici', name: 'ICICI Direct', kind: 'stocks' },
  { id: 'hdfcsec', name: 'HDFC Securities', kind: 'stocks' },
  { id: 'kotak', name: 'Kotak Securities', kind: 'stocks' },
  { id: 'angel', name: 'Angel One', kind: 'stocks' },
  { id: 'upstox', name: 'Upstox', kind: 'stocks' },
  { id: 'groww', name: 'Groww', kind: 'stocks' },
  { id: 'anandrathi', name: 'Anand Rathi', kind: 'stocks' },
  { id: 'motilal', name: 'Motilal Oswal', kind: 'stocks' },
  { id: 'sharekhan', name: 'Sharekhan', kind: 'stocks' },
  { id: 'iifl', name: 'IIFL Securities', kind: 'stocks' },
];

export const importTemplates = [
  { id: 't-ar', name: 'Anand Rathi - Trade Summary', brokerId: null, assetType: 'EQ', format: 'Excel', recommended: true, autoImport: false },
  { id: 't-cams', name: 'Mutual Fund CAS - CAMSOnline', brokerId: null, assetType: 'MF', format: 'PDF', recommended: true, autoImport: true },
];

export const changelog = [
  {
    id: 'c1', title: 'Analytics: Equity Exposure', date: '2026-08-20',
    paragraphs: ['See your look-through exposure to individual stocks, sectors and market caps across direct equity and mutual funds.'],
    bullets: ['Stock-wise, sector-wise and market-cap-wise breakdown', 'Available for portfolios and groups', 'Export to Excel'],
  },
  {
    id: 'c2', title: 'Reports: Transaction-wise Returns', date: '2026-07-02',
    paragraphs: ['Track performance at the transaction level with absolute gain, percentage returns and annualised returns (CAGR).'],
    bullets: ['Available for Stocks, Mutual Funds, Private Equity, Traded Bonds and NCDs'],
  },
  {
    id: 'c3', title: 'Import: Auto-import via email', date: '2026-05-14',
    paragraphs: ['Forward contract notes and CAS statements to your dedicated import address and they will be processed automatically.'],
    bullets: [],
  },
];

export const tasks = [];

export const corporateActions = [];

export const preferences = {
  defaultSort: 'Name',
  sortDirection: 'Ascending',
  zeroHoldings: 'Hide',
  decimals: 'Show',
  separator: 'Lakhs',
  fontSize: 'Small',
  pmsWithinGroups: 'Line-item',
  showPortfolioFullName: 'Yes',
};

export const advisorProfile = { name: '', address1: '', address2: '', phone: '', email: '' };

export const autoTransferCharges = { invNonTrading: false, invTrading: false, fo: false };

export const helpArticles = [
  'How can I download my NPS tier 1 transaction statement from NSDL?',
  'How do I get my historical trade data from my broker?',
  'How do I import my Stock investments?',
  'Step-wise guide to Goal & Strategy Tracking',
  'Get your historical equity trades from HDFC Securities',
];
