export interface Person {
  id: string;
  name: string;
}

export interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedTo: string[]; // Array of Person IDs
}

export interface ExtraCharge {
  id: string;
  name: string;
  value: number;
  type: 'percentage' | 'fixed';
  splitMode?: 'proportional' | 'equal';
}

export interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  splitMode?: 'proportional' | 'equal';
}

export interface Bill {
  id: string;
  shopName?: string;
  currency?: string;
  roundingMode?: 'none' | '1' | '10' | '100' | '1000';
  items: BillItem[];
  people: Person[];
  tax: number; // percentage
  serviceCharge: number; // percentage
  extraCharges: ExtraCharge[];
  discounts: Discount[];
}

export interface SplitResult {
  personId: string;
  personName: string;
  shopName?: string;
  items: {
    name: string;
    originalPrice: number;
    splitPrice: number;
  }[];
  subtotal: number;
  taxAmount: number;
  serviceChargeAmount: number;
  extraChargesAmount: number;
  discountAmount: number;
  total: number;
}
