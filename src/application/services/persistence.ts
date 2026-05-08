const STORAGE_KEY = 'ag_splitbill_data';
const SETTINGS_KEY = 'ag_splitbill_settings';

export type PersistenceType = 'local' | 'session' | 'none';

export const saveState = (state: any, type: PersistenceType) => {
  if (type === 'none') {
    // Clear any existing data if user chooses 'none'
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }

  const serializedState = JSON.stringify(state);
  const storage = type === 'local' ? localStorage : sessionStorage;
  
  // Clear other storage to avoid confusion
  if (type === 'local') sessionStorage.removeItem(STORAGE_KEY);
  else localStorage.removeItem(STORAGE_KEY);

  storage.setItem(STORAGE_KEY, serializedState);
};

export const loadState = (type: PersistenceType) => {
  if (type === 'none') return null;
  
  const storage = type === 'local' ? localStorage : sessionStorage;
  const serializedState = storage.getItem(STORAGE_KEY);
  
  if (serializedState === null) return null;
  return JSON.parse(serializedState);
};

export const saveSettings = (settings: { persistenceType: PersistenceType }) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const loadSettings = (): { persistenceType: PersistenceType } => {
  const serializedSettings = localStorage.getItem(SETTINGS_KEY);
  if (serializedSettings === null) return { persistenceType: 'none' };
  return JSON.parse(serializedSettings);
};
