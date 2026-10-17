import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/theme';
import { Icon, type IconName } from './ui';

const TABS: Record<string, { icon: IconName; label: string }> = {
  index: { icon: 'home', label: 'Asosiy' },
  search: { icon: 'search', label: 'Qidiruv' },
  chat: { icon: 'message-square', label: 'Xabarlar' },
  profile: { icon: 'user', label: 'Profil' },
};

/** Floating dark capsule with a gold "+" in the middle (opens the post flow). */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: chats } = useQuery({
    queryKey: ['chats'],
    enabled: isAuthenticated,
    queryFn: async () => (await getApi().chats.list()) as unknown as { unread: number }[],
    refetchInterval: 15_000,
  });
  const unread = (chats ?? []).reduce((n, c) => n + (c.unread ?? 0), 0);

  const items = state.routes.map((route, index) => {
    const meta = TABS[route.name];
    if (!meta) return null;
    const focused = state.index === index;
    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
    };
    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityLabel={route.name === 'chat' && unread ? `${meta.label}, ${unread} ta yangi` : meta.label}
        accessibilityState={{ selected: focused }}
        onPress={onPress}
        style={styles.item}
      >
        <View style={[styles.halo, focused && styles.haloOn]}>
          <Icon name={meta.icon} size={22} color={focused ? colors.white : 'rgba(255,255,255,0.55)'} />
        </View>
        {route.name === 'chat' && unread > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
          </View>
        ) : null}
      </Pressable>
    );
  });

  // Centre "+" sits between the 2nd and 3rd tab.
  items.splice(
    2,
    0,
    <View key="post" style={styles.item}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Eʼlon joylash"
        onPress={() => router.push('/post')}
        style={({ pressed }) => [styles.plus, pressed && { transform: [{ scale: 0.94 }] }]}
      >
        <Icon name="plus" size={24} color={colors.ink} />
      </Pressable>
    </View>,
  );

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom - 6, 14) }]}>
      <View style={styles.bar}>{items}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16 },
  bar: {
    height: 68,
    borderRadius: 999,
    backgroundColor: colors.tabBar,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    ...Platform.select({
      ios: { shadowColor: colors.ink, shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: 14 } },
      default: { elevation: 12 },
    }),
  },
  item: { flex: 1, height: 56, alignItems: 'center', justifyContent: 'center' },
  halo: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  haloOn: { backgroundColor: 'rgba(63,163,107,0.35)' },
  plus: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: colors.goldSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: 8, left: '50%', marginLeft: 6, minWidth: 17, height: 17, paddingHorizontal: 4,
    borderRadius: 9, backgroundColor: colors.greenBright, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#141A16',
  },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: '800' },
});
