export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'IDR', symbol: 'Rp', name: 'Rupiah (IDR)' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', name: 'Pound (GBP)' },
  { code: 'JPY', symbol: '¥', name: 'Yen (JPY)' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (SGD)' },
  { code: 'MYR', symbol: 'RM', name: 'Ringgit (MYR)' },
  { code: 'THB', symbol: '฿', name: 'Baht (THB)' },
  { code: 'PHP', symbol: '₱', name: 'Peso (PHP)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (CAD)' },
  { code: 'KRW', symbol: '₩', name: 'Won (KRW)' },
  { code: 'CNY', symbol: '¥', name: 'Yuan (CNY)' },
];

export const DEFAULT_CURRENCY = 'IDR';

export const getCurrencySymbol = (code: string = DEFAULT_CURRENCY): string => {
  const found = CURRENCIES.find(c => c.code === code);
  return found ? found.symbol : (code || 'Rp');
};

export const roundValue = (value: number, mode: string = 'none'): number => {
  if (mode === 'none' || !mode) return value;
  const factor = parseInt(mode, 10);
  if (isNaN(factor)) return value;
  return Math.round(value / factor) * factor;
};

export const formatNumber = (val: number): string => {
  return Number(val.toFixed(4)).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  });
};

export const formatMoney = (amount: number, currencyCode: string = DEFAULT_CURRENCY): string => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol} ${formatNumber(amount)}`;
};
