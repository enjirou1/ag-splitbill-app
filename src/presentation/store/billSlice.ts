import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Bill, BillItem, Person, ExtraCharge, Discount } from '@/domain/entities/Bill';

interface BillState extends Bill {
  shopName: string;
  currency: string;
  loading: boolean;
  error: string | null;
  persistenceType: 'local' | 'session' | 'none';
}

const initialState: BillState = {
  id: '1',
  items: [],
  people: [],
  tax: 0,
  serviceCharge: 0,
  extraCharges: [],
  discounts: [],
  shopName: '',
  currency: 'IDR',
  loading: false,
  error: null,
  persistenceType: 'local',
};

const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {
    updateShopName: (state, action: PayloadAction<string>) => {
      state.shopName = action.payload;
    },
    updateCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    addItem: (state, action: PayloadAction<Omit<BillItem, 'id'>>) => {
      const newItem = { ...action.payload, id: Math.random().toString(36).substr(2, 9) };
      state.items.push(newItem);
    },
    updateItem: (state, action: PayloadAction<BillItem>) => {
      const index = state.items.findIndex(i => i.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    addPerson: (state, action: PayloadAction<string>) => {
      const newPerson = { id: Math.random().toString(36).substr(2, 9), name: action.payload };
      state.people.push(newPerson);
    },
    removePerson: (state, action: PayloadAction<string>) => {
      state.people = state.people.filter(p => p.id !== action.payload);
      // Remove person from items
      state.items.forEach(item => {
        item.assignedTo = item.assignedTo.filter(id => id !== action.payload);
      });
    },
    updatePerson: (state, action: PayloadAction<Person>) => {
      const index = state.people.findIndex(p => p.id === action.payload.id);
      if (index !== -1) state.people[index] = action.payload;
    },
    updateTax: (state, action: PayloadAction<number>) => {
      state.tax = action.payload;
    },
    updateServiceCharge: (state, action: PayloadAction<number>) => {
      state.serviceCharge = action.payload;
    },
    addExtraCharge: (state, action: PayloadAction<Omit<ExtraCharge, 'id'>>) => {
      const newCharge = { ...action.payload, id: Math.random().toString(36).substr(2, 9) };
      state.extraCharges.push(newCharge);
    },
    removeExtraCharge: (state, action: PayloadAction<string>) => {
      state.extraCharges = state.extraCharges.filter(c => c.id !== action.payload);
    },
    updateExtraCharge: (state, action: PayloadAction<ExtraCharge>) => {
      const index = state.extraCharges.findIndex(c => c.id === action.payload.id);
      if (index !== -1) state.extraCharges[index] = action.payload;
    },
    addDiscount: (state, action: PayloadAction<Omit<Discount, 'id'>>) => {
      const newDiscount = { ...action.payload, id: Math.random().toString(36).substr(2, 9) };
      state.discounts.push(newDiscount);
    },
    removeDiscount: (state, action: PayloadAction<string>) => {
      state.discounts = state.discounts.filter(d => d.id !== action.payload);
    },
    updateDiscount: (state, action: PayloadAction<Discount>) => {
      const index = state.discounts.findIndex(d => d.id === action.payload.id);
      if (index !== -1) state.discounts[index] = action.payload;
    },
    resetBill: (state) => {
      return initialState;
    },
    setItems: (state, action: PayloadAction<BillItem[]>) => {
      state.items = action.payload;
    },
    addItems: (state, action: PayloadAction<Omit<BillItem, 'id' | 'assignedTo'>[]>) => {
      const newItems = action.payload.map(item => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        assignedTo: []
      }));
      state.items.push(...newItems);
    },
    autofillBill: (state, action: PayloadAction<{
      items: Omit<BillItem, 'id' | 'assignedTo'>[],
      tax?: number,
      serviceCharge?: number,
      discounts?: Omit<Discount, 'id'>[]
    }>) => {
      state.items = action.payload.items.map(item => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        assignedTo: []
      }));
      if (action.payload.tax !== undefined) state.tax = action.payload.tax;
      if (action.payload.serviceCharge !== undefined) state.serviceCharge = action.payload.serviceCharge;
      if (action.payload.discounts !== undefined) {
        state.discounts = action.payload.discounts.map(d => ({
          ...d,
          id: Math.random().toString(36).substr(2, 9)
        }));
      }
    },
    setPersistenceType: (state, action: PayloadAction<BillState['persistenceType']>) => {
      state.persistenceType = action.payload;
    },
    hydrate: (state, action: PayloadAction<Partial<BillState>>) => {
      return { ...state, ...action.payload };
    }
  },
});

export const {
  addItem, updateItem, removeItem,
  addPerson, removePerson, updatePerson,
  updateTax, updateServiceCharge,
  addExtraCharge, removeExtraCharge, updateExtraCharge,
  addDiscount, removeDiscount, updateDiscount,
  updateShopName, updateCurrency,
  resetBill, setItems, addItems, autofillBill,
  hydrate
} = billSlice.actions;

export default billSlice.reducer;
