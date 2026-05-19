import AsyncStorage from '@react-native-async-storage/async-storage';

const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const memoryStore = new Map<string, string | null>();

async function getItem(key: string): Promise<string | null> {
  try {
    // Try native AsyncStorage first
    const val = await AsyncStorage.getItem(key);
    if (val !== null && val !== undefined) return val;
  } catch (err) {
    // ignore and fallback
  }

  // Fallback to web localStorage
  try {
    if (isWeb && typeof window.localStorage !== 'undefined') {
      const v = window.localStorage.getItem(key);
      return v !== null ? v : null;
    }
  } catch (err) {
    // ignore
  }

  // In-memory fallback
  return memoryStore.has(key) ? (memoryStore.get(key) || null) : null;
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
    return;
  } catch (err) {
    // ignore and fallback
  }

  try {
    if (isWeb && typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch (err) {
    // ignore
  }

  memoryStore.set(key, value);
}

async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
    return;
  } catch (err) {
    // ignore and fallback
  }

  try {
    if (isWeb && typeof window.localStorage !== 'undefined') {
      window.localStorage.removeItem(key);
      return;
    }
  } catch (err) {
    // ignore
  }

  memoryStore.delete(key);
}

export { getItem, removeItem, setItem };

