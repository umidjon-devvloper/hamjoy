import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApi } from '@/lib/api';
import { colors, radius, spacing } from '@/lib/theme';

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
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => (await getApi().chats.list()) as unknown as ChatRow[],
    refetchInterval: 15_000,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Suhbatlar</Text>
      </View>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.accent} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Hali suhbat yo'q</Text>
              <Text style={styles.emptyHint}>E'lon ustiga bosib yozishni boshlang</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              onPress={() => router.push(`/chat/${item.id}`)}
            >
              <View style={styles.rowMain}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.listing?.title ?? "E'lon mavjud emas"}
                </Text>
                <Text style={styles.rowMeta}>
                  {item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleString('uz-UZ') : 'xabar yo‘q'}
                </Text>
              </View>
              {item.unread > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unread}</Text>
                </View>
              ) : null}
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  title: { color: colors.fg, fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  sep: { height: 1, backgroundColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  pressed: { opacity: 0.6 },
  rowMain: { flex: 1 },
  rowTitle: { color: colors.fg, fontSize: 15, fontWeight: '600' },
  rowMeta: { color: colors.dim, fontSize: 12, marginTop: 2 },
  badge: {
    backgroundColor: colors.accent,
    minWidth: 22,
    height: 22,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.bg, fontSize: 12, fontWeight: '700' },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText: { color: colors.fg, fontSize: 15, fontWeight: '600' },
  emptyHint: { color: colors.muted, fontSize: 13, marginTop: 4 },
});
