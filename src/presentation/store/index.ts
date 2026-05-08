import { configureStore } from '@reduxjs/toolkit';
import billReducer from './billSlice';
import { saveState } from '@/application/services/persistence';

export const store = configureStore({
  reducer: {
    bill: billReducer,
  },
});

// Subscribe to store changes to persist data
store.subscribe(() => {
  const state = store.getState();
  const { persistenceType, ...billData } = state.bill;
  
  if (typeof window !== 'undefined') {
    saveState(billData, persistenceType);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
