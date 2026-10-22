import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, EmptyState, Icon, Segmented } from '@/components/ui';
import { getApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { getSocket } from '@/lib/socket';
import { timeAgo } from '@/lib/data';
import { colors, radius, shadow, TAB_BAR_SPACE, type } from '@/lib/theme';

interface ChatRow {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  lastMessageAt: string | null;
  unread: number;
  listing: { id: string; title: string; status: string } | null;
}

export default function ChatList() {
  const router = useRouter();
  const { me } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [q, setQ] = useState('');
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => (await getApi().chats.list()) as unknown as ChatRow[],
    refetchInterval: 15_000,
  });

  // Live chat list: any new message or read event just refetches so the
  // unread count and last-message time stay authoritative.
  useEffect(() => {
    let sockRef: Awaited<ReturnType<typeof getSocket>> | null = null;
    let cancelled = false;
    void (async () => {
      const sock = await getSocket();
      if (cancelled || !sock) return;
      sockRef = sock;
      const bump = () => {
        void refetch();
      };
      sock.on('chat:message', bump);
      sock.on('chat:read', bump);
    })();
    return () => {
      cancelled = true;
      sockRef?.off('chat:message');
      sockRef?.off('chat:read');
    };
  }, [refetch]);

  const rows = (data ?? [])
    .filter((c) => filter === 'all' || c.unread > 0)
    .filter((c) => !q || (c.listing?.title ?? '').toLowerCase().includes(q.toLowerCase()));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={rows}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.green} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={type.display}>Xabarlar</Text>
            <View style={[styles.field, shadow.soft]}>
              <Icon name="search" size={18} color={colors.muted} />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Suhbatlarni qidirish"
                placeholderTextColor={colors.dim}
                style={styles.input}
                accessibilityLabel="Suhbatlarni qidirish"
              />
            </View>
            <Segmented
              options={[
                { value: 'all', label: 'Hammasi' },
                { value: 'unread', label: 'Oʻqilmagan' },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.green} style={{ marginTop: 32 }} />
          ) : (
            <EmptyState icon="message-circle" title="Hali suhbat yoʻq" text="Eʼlon sahifasida “Yozish” tugmasini bosing — suhbat shu yerda paydo boʻladi." />
          )
        }
        renderItem={({ item }) => {
          const iAmSeller = item.sellerId === me?.user.id;
          const title = item.listing?.title ?? 'Eʼlon mavjud emas';
          return (
            <Pressable
              onPress={() => router.push(`/chat/${item.id}`)}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
            >
              <Avatar name={title} tone={iAmSeller ? 'gold' : 'deep'} size={52} />
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <View style={styles.rowTop}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {title}
                  </Text>
                  <Text style={[styles.time, item.unread > 0 && { color: colors.green, fontWeight: '700' }]}>
                    {item.lastMessageAt ? timeAgo(item.lastMessageAt) : ''}
                  </Text>
                </View>
                <View style={styles.rowTop}>
                  <Text style={type.small} numberOfLines={1}>
                    {iAmSeller ? 'Xaridor siz bilan bogʻlandi' : 'Sotuvchi bilan suhbat'}
                  </Text>
                  {item.unread > 0 ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.unread}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  list: { paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE },
  header: { gap: 14, paddingTop: 16, paddingBottom: 16 },
  field: { height: 52, borderRadius: radius.pill, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18 },
  input: { flex: 1, fontSize: 15, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 22, backgroundColor: colors.surface },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rowTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.ink },
  time: { fontSize: 12, color: colors.muted },
  badge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: '800' },
});
