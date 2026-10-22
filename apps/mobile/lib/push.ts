import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { API_URL, tokens as authTokens } from './api';

async function authHeader(): Promise<Record<string, string>> {
  const token = await authTokens.getAccess();
  return token
    ? { authorization: `Bearer ${token}`, 'content-type': 'application/json' }
    : { 'content-type': 'application/json' };
}

/**
 * Ask for notification permission, grab an Expo push token, and register it
 * with the Joymee API. Call after sign-in. Returns the token on success.
 * No-op on an emulator/simulator, where Expo cannot produce a device token.
 */
export async function registerPushToken(): Promise<string | null> {
  try {
    const settings = await Notifications.getPermissionsAsync();
    let status = settings.status;
    if (status !== 'granted') {
      const asked = await Notifications.requestPermissionsAsync();
      status = asked.status;
    }
    if (status !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const projectId =
      (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId ??
      Constants.easConfig?.projectId;
    const token = (
      await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)
    ).data;
    if (!token) return null;

    const res = await fetch(`${API_URL}/devices/register`, {
      method: 'POST',
      headers: await authHeader(),
      body: JSON.stringify({
        platform: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
        token,
      }),
    });
    if (!res.ok) return null;
    return token;
  } catch {
    // Simulator, missing credentials, offline — stay silent and let the app run.
    return null;
  }
}

export async function unregisterPushToken(token: string): Promise<void> {
  try {
    await fetch(`${API_URL}/devices/register`, {
      method: 'DELETE',
      headers: await authHeader(),
      body: JSON.stringify({ token }),
    });
  } catch {
    /* ignore */
  }
}
