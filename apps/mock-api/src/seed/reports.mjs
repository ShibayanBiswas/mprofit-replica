// Reports catalog as observed on the live Reports modal (category → report → chips/description).
const r = (id, name, description, chips = [], generate = false) => ({ id, name, description, chips, hasPreview: true, generate });

export const reportsCatalog = {
  title: 'MProfit Reports',
  categories: [
    {
      id: 'prime', name: 'Prime',
      reports: [
        r('apr', 'Advanced Performance Review', [
          'A comprehensive report delivering detailed performance analysis for all categories & assets within a portfolio or group:',
          '- Performance metrics, including XIRR, across customisable categories — such as equity, debt, and others',
          '- XIRR comparisons against different benchmark indices or blends',
          '- User-defined time period',
        ], [], true),
        r('aps', 'Advanced Performance Snapshot', [
          'A comprehensive performance snapshot for a portfolio or group:',
          '- Performance metrics, including XIRR, across customisable categories — such as equity, debt, and others',
          '- XIRR comparisons against different benchmark indices or blends',
          '- User-defined time period',
        ], [], true),
        r('aif', 'AIF Investment Review', [
          'Review all key metrics for your AIF investments including commitment amounts, drawdowns, redemptions, XIRR.',
          'Generate the report since inception or for any date range.',
        ], [], true),
      ],
    },
    {
      id: 'performance', name: 'Performance',
      reports: [
        r('ps', 'Portfolio Summary', ['Get an overview of your active portfolio holdings with current valuations. You can sort, filter & customise this report and save as Excel or PDF.'], ['All Assets', 'Stocks & ETFs', 'MF (Equity)', 'MF (Debt)']),
        r('xirr', 'Annualised Return (XIRR)', ['Get a detailed view of your annualized return for each asset, asset category, individual portfolio or group of portfolios. You can sort, filter & customise this report and save as Excel or PDF.'], ['All Assets', 'Stocks & ETFs', 'MF (Equity)', 'MF (Debt)']),
        r('twr', 'Transaction-wise Returns Report', ['Track performance at the transaction level with absolute gain, percentage returns, and annualized returns (CAGR)'], ['All Assets', 'Stocks & ETFs', 'Mutual Funds', 'Private Equity', 'Traded Bonds', 'NCDs']),
        r('hv', 'Historical Valuation', ['View historical end-of-month valuations for Stocks and Mutual Funds in your portfolio. You can sort, filter & customise this report and save as Excel or PDF.'], ['Stocks & ETFs', 'MF (Equity)', 'MF (Debt)']),
        r('pls', 'P&L Summary', ['Get a summary report of your realised P&L across a selected time period in a portfolio.'], ['All Assets', 'Stocks & ETFs', 'Mutual Funds', 'Private Equity', 'Traded Bonds', 'NCDs']),
        r('pld', 'P&L Detailed', ['Get a detailed report of your realised P&L across a selected time period in a portfolio.'], ['All Assets', 'Stocks & ETFs', 'Mutual Funds', 'Private Equity', 'Traded Bonds', 'NCDs']),
      ],
    },
    {
      id: 'capital-gains', name: 'Capital Gains',
      reports: [
        r('cgs', 'Capital Gains - Summary', [
          'Get an overview of your realised Capital Gains for Stocks, Mutual Funds & Traded Bonds for any financial year. Save this report as Excel or PDF.',
          'You can view this report with or without Grandfathering applied for Stocks & Equity MFs and with or without indexation for Debt MFs.',
        ], ['Stocks', 'Stocks & MF (Equity)', 'MF (Equity)', 'MF (Debt / Hybrid)', 'InvITs & REITs', 'Traded Bonds']),
        r('cgitr', 'Capital Gains - ITR Format', [
          'View your intra-day, short-term & long-term Capital Gains with ISIN Details in Income Tax Return Format. You can view your Capital Gains for any financial year and save the report as Excel or PDF.',
          'Get Fair Market Value (highest price on 31st Jan, 2018) & Cost of Acquisition details for Stocks and Equity MFs as per LTCG Grandfathering clause. View your Capital Gains with or without indexation for Debt MFs and Traded Bonds.',
        ], ['Stocks', 'MF (Equity)', 'MF (Debt / Hybrid)', 'InvITs & REITs', 'Traded Bonds']),
        r('s112a', 'Schedule 112A ITR Format', [
          'Download an Excel report detailing your long-term Capital Gains with ISIN details for any financial year in the ITR Schedule 112A format. Please note that Schedule 112A is only for long-term capital gains as per Income Tax rules.',
          'You can copy & paste details in the relevant columns from this report into the Capital Gain sheet downloaded from the ITR Utility.',
        ], ['Stocks', 'MF (Equity)']),
        r('ucgs', 'Unrealised Capital Gains - Summary', [
          'Get an overview of your Unrealised Capital Gains for Stocks, Mutual Funds & Traded Bonds. Save this report as Excel or PDF.',
          'You can view this report with or without Grandfathering applied for Stocks & Equity MFs and with or without indexation for Debt MFs.',
        ], ['Stocks', 'Stocks & MF (Equity)', 'MF (Equity)', 'MF (Debt / Hybrid)', 'InvITs & REITs', 'Traded Bonds']),
        r('ucgd', 'Unrealised Capital Gains - Detailed', [
          'View your intra-day, short-term & long-term Unrealised Capital Gains with ISIN Details. Save the report as Excel or PDF.',
          'Get Fair Market Value (highest price on 31st Jan, 2018) & Cost of Acquisition details for Stocks and Equity MFs as per LTCG Grandfathering clause. View your Capital Gains with or without indexation for Debt MFs and Traded Bonds.',
        ], ['Stocks', 'MF (Equity)', 'MF (Debt / Hybrid)', 'InvITs & REITs', 'Traded Bonds']),
      ],
    },
    {
      id: 'transactions', name: 'Transactions',
      reports: [
        r('cns', 'Contract Note Summary', ['Get a summary report for all contract notes imported across a selected time period to a portfolio. Details in the report include Contract Note Date, Broker Name, Contract Note Number and Amount Payable / Receivable.'], [], true),
        r('cnc', 'Contract Note Charges', ['Get a report detailing your stock contract note charges across a selected time period in a portfolio. For each contract note in the selected time period - view STT, GST, Stamp Charges, Transaction Charges and Other Charges.'], [], true),
        r('st', 'Stock Transactions', ['Get a report detailing all your Stock transactions across a selected time period in a portfolio. For each transaction in the report, view Date, Quantity, Price, Brokerage and Amount.'], [], true),
        r('mft', 'Mutual Fund Transactions', ['Get a report detailing all your Mutual Fund transactions across a selected time period in a portfolio. For each transaction in the report, view Date, Quantity, Price, Gross Amount, STT, Stamp Charges, TDS and Net Amount.'], ['Date-wise', 'Scheme-wise']),
      ],
    },
    {
      id: 'advanced', name: 'Advanced',
      reports: [
        r('cb', 'Closing Balance', ['View closing balance quantity & amount with date-wise purchase for every asset in your portfolio, as of any date specified by you.'], ['Stocks & ETFs', 'Mutual Funds']),
        r('hp', 'Holding Period', ['View holding period information along with closing balance quantity, amount and date-wise purchase for every asset in your portfolio.'], ['Stocks & ETFs', 'Mutual Funds']),
        r('sr', 'Stock Register', ['For any defined time period, view opening balances, date-wise transactions with gain/loss and closing balances for each asset.'], ['Stocks & ETFs', 'Mutual Funds']),
      ],
    },
    {
      id: 'tax-software', name: 'Tax Software Formats',
      reports: ['ClearTax', 'Winman', 'CompuTax', 'Spectrum', 'Genius', 'TaxPro'].map((sw) =>
        r(`tsf-${sw.toLowerCase()}`, `${sw} - Capital Gains ITR Format`, [
          `Download an Excel report detailing your short-term and long-term Capital Gains with ISIN details for any financial year in ${sw} Software format.`,
          `You can copy & paste details in the relevant columns from this report into the Capital Gain sheet provided to you by ${sw}.`,
          ...(sw === 'ClearTax' ? ['Do not copy the blank columns from this report, as they correspond to columns containing formulas in the ClearTax sheet.'] : []),
        ], ['Stocks', 'MF (Equity)', 'MF (Debt / Hybrid)'])),
    },
    {
      id: 'income', name: 'Income & Other',
      reports: [
        r('irs', 'Income Report - Summary', ['Get an overview of your dividend, interest & other income across all asset categories. You can filter & customise this report and save as Excel or PDF.'], [], true),
        r('ird', 'Income Report - Detailed', ['Get date-wise details across all asset categories for dividend, interest & other income in your portfolio. You can sort, filter & customise this report and save as Excel or PDF.'], [], true),
        r('fdd', 'FD & Deposit Report', ['Get an overview of all your FDs and Deposits with details such as Maturity date, Interest type, Interest %, Investment Date, Principal Amount and Maturity Amount.'], [], true),
        r('ulip', 'ULIP & Insurance Report', ['Get an overview of all your ULIP and Insurance Policies with details such as Policy No., Sum Assured, Nominee, Total Premium Paid, Total Withdrawal and Maturity Date. Get a total of Sum Assured across all your policies.'], [], true),
        r('due', 'Due Dates Report', ['Keep track of due dates for policy premium payments of Insurance or NPS / ULIP assets. Stay updated with maturity dates for various assets such as FDs, PPF, loans and deposits.'], ['All Assets', 'FDs', 'Insurance', 'NPS / ULIP']),
      ],
    },
  ],
};

export const reportJobs = [];
