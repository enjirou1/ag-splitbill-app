export const formatThousand = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '';
  
  const str = val.toString();
  const parts = str.split(/[.,]/);
  
  // Format the integer part
  const integerPart = parts[0].replace(/[^\d]/g, '');
  if (!integerPart && parts.length === 1) return '';
  
  const formattedInteger = integerPart ? Number(integerPart).toLocaleString('en-US') : '';
  
  if (parts.length > 1) {
    // Keep the decimal part (only digits)
    const decimalPart = parts[1].replace(/[^\d]/g, '');
    return `${formattedInteger}.${decimalPart}`;
  }
  
  return formattedInteger;
};

export const parseThousand = (val: string): string => {
  // Remove all commas (thousand separators)
  const clean = val.replace(/,/g, '');
  
  const parts = clean.split('.');
  if (parts.length > 1) {
    return parts[0].replace(/[^\d]/g, '') + '.' + parts[1].replace(/[^\d]/g, '');
  }
  return clean.replace(/[^\d]/g, '');
};

