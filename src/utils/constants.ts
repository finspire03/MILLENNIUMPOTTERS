export const BRANCHES = [
  {
    id: 'igando',
    name: 'Igando Branch',
    code: 'IGD',
    address: 'Igando, Lagos, Nigeria',
    phone: '+234 (0) 803 123 4567',
    coordinates: { lat: 6.5244, lng: 3.3792 }
  },
  {
    id: 'abule-egba',
    name: 'Abule-Egba Branch',
    code: 'AEB',
    address: 'Abule-Egba, Lagos, Nigeria',
    phone: '+234 (0) 803 765 4321',
    coordinates: { lat: 6.6258, lng: 3.3181 }
  }
] as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  SUB_ADMIN: 'sub_admin',
  AGENT: 'agent'
} as const;

export const LOAN_PRODUCTS = [
  {
    id: '30k-loan',
    name: '₦30K Loan',
    principalAmount: 30000,
    dailyPayment: 1500,
    durationDays: 30,
    totalAmount: 45000
  },
  {
    id: '40k-loan',
    name: '₦40K Loan',
    principalAmount: 40000,
    dailyPayment: 2000,
    durationDays: 25,
    totalAmount: 50000
  },
  {
    id: '50k-loan',
    name: '₦50K Loan',
    principalAmount: 50000,
    dailyPayment: 2500,
    durationDays: 25,
    totalAmount: 62500
  },
  {
    id: '60k-loan',
    name: '₦60K Loan',
    principalAmount: 60000,
    dailyPayment: 3000,
    durationDays: 25,
    totalAmount: 75000
  },
  {
    id: '80k-loan',
    name: '₦80K Loan',
    principalAmount: 80000,
    dailyPayment: 4000,
    durationDays: 25,
    totalAmount: 100000
  },
  {
    id: '100k-loan',
    name: '₦100K Loan',
    principalAmount: 100000,
    dailyPayment: 5000,
    durationDays: 25,
    totalAmount: 125000
  },
  {
    id: '150k-loan',
    name: '₦150K Loan',
    principalAmount: 150000,
    dailyPayment: 7500,
    durationDays: 25,
    totalAmount: 187500
  },
  {
    id: '200k-loan',
    name: '₦200K Loan',
    principalAmount: 200000,
    dailyPayment: 10000,
    durationDays: 25,
    totalAmount: 250000
  }
] as const;

export const LOAN_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DISBURSED: 'disbursed'
} as const;

export const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'Mobile Money',
  'Check'
] as const;

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' }
] as const;

export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
] as const;
