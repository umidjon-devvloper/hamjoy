import * as SecureStore from 'expo-secure-store';
import { createClient, type TokenStore } from '@joymee/sdk';
import Constants from 'expo-constants';

const ACCESS_KEY = 'joymee.access';
const REFRESH_KEY = 'joymee.refresh';

const secureTokens: TokenStore = {
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

const baseUrl =
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  'http://localhost:4000';

export const api = createClient({
  baseUrl,
  tokens: secureTokens,
});
