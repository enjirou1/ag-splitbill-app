'use client';

import { Provider } from 'react-redux';
import { store } from './index';
import { LanguageProvider } from '../context/LanguageContext';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </Provider>
  );
}
