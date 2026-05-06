import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Bill, BillItem, Person, ExtraCharge } from '@/domain/entities/Bill';

interface BillState extends Bill {
  loading: boolean;
  error: string | null;
}

const initialState: BillState = {
  id: '1',
  items: [],
  people: [],
  tax: 0,
  serviceCharge: 0,
  extraCharges: [],
  loading: false,
  error: null,
};

const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {
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
    }
  },
});

export const { 
  addItem, updateItem, removeItem, 
  addPerson, removePerson, 
  updateTax, updateServiceCharge, 
  addExtraCharge, removeExtraCharge,
  resetBill, setItems, addItems
} = billSlice.actions;

export default billSlice.reducer;
