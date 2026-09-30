// Demo accounts (01-IN-SCOPE-OUT-OF-SCOPE.md). Plain text is acceptable for a local mock only.
export const users = [
  { id: 'u1', email: 'shibayanbiswas@rathi.com', password: 'Shibayan@123', displayName: 'Shibayan Biswas', role: 'Owner' },
  { id: 'u2', email: 'hasyapatel@rathi.com', password: 'Hasya@123', displayName: 'Hasya Patel', role: 'Admin' },
  { id: 'u3', email: 'sahilshahani@rathi.com', password: 'Sahil@123', displayName: 'Sahil Shahani', role: 'Owner' },
  { id: 'u4', email: 'ferozeazeez@rathi.com', password: 'Feroze@123', displayName: 'Feroze Azeez', role: 'User' },
];

export const databases = [
  { id: '54db4e5354537b2e', name: 'Rathi Wealth', plan: 'MProfit Wealth', expiryDate: '2027-03-31', activeUsers: 4, maxUsers: 10 },
];

export const accessUsers = [
  { id: 'a1', email: 'sahilshahani@rathi.com', type: 'Owner', access: 'All Families' },
  { id: 'a2', email: 'shibayanbiswas@rathi.com', type: 'Admin', access: 'All Families' },
  { id: 'a3', email: 'hasyapatel@rathi.com', type: 'Admin', access: 'All Families' },
  { id: 'a4', email: 'ferozeazeez@rathi.com', type: 'User', access: 'All Families' },
];
