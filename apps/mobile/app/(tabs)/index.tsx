import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListingCard } from '@/components/ListingCard';
import { useAuth } from '@/lib/auth';
import { getApi } from '@/lib/api';
import { colors, spacing } from '@/lib/theme';

interface RawListing {
  id: string;
  title: string;
  type: string;
  priceAmount?: number | string | null;
  priceCurrency?: string | null;
  createdAt: string;
}

export default function Home() {
  const { me } = useAuth();
  const { data, isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: ['listings', 'feed'],
    queryFn: async () => {
      const res = await getApi().listings.search({ limit: 30 });
      return res.items as unknown as RawListing[];
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.hello}>Salom, {me?.profile?.fullName ?? 'Joymee foydalanuvchi'}</Text>
        <Text style={styles.title}>Yangi e'lonlar</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Yuklab bo'lmadi</Text>
          <Text style={styles.errorHint}>{(error as Error).message}</Text>
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Hali e'lonlar yo'q</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ListingCard
              id={item.id}
              title={item.title}
              priceAmount={item.priceAmount != null ? Number(item.priceAmount) : null}
              priceCurrency={item.priceCurrency}
              type={item.type}
              createdAt={item.createdAt}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: 4 },
  hello: { color: colors.muted, fontSize: 13 },
  title: { color: colors.fg, fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  errorText: { color: colors.rose, fontSize: 15, fontWeight: '600' },
  errorHint: { color: colors.muted, fontSize: 12, marginTop: 4 },
  emptyText: { color: colors.muted, fontSize: 14 },
});
