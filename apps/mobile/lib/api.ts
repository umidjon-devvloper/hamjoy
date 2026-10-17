import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { createClient, type JoymeeClient, type TokenStore } from '@joymee/sdk';

const ACCESS_KEY = 'joymee.access';
const REFRESH_KEY = 'joymee.refresh';

export const tokens: TokenStore = {
  getAccess: () => SecureStore.getItemAsync(ACCESS_KEY),
  getRefresh: () => SecureStore.getItemAsync(REFRESH_KEY),
  setTokens: async (access, refresh) => {
    await SecureStore.setItemAsync(ACCESS_KEY, access);
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
  },
  clear: async () => {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};

const extra = (Constants.expoConfig?.extra ?? {}) as { apiUrl?: string };
export const API_URL = extra.apiUrl ?? 'http://localhost:4001';

let singleton: JoymeeClient | null = null;
export function getApi(): JoymeeClient {
  if (!singleton) {
    singleton = createClient({ baseUrl: API_URL, tokens });
  }
  return singleton;
}
