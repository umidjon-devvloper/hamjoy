import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListingCard } from '@/components/ListingCard';
import { getApi } from '@/lib/api';
import { colors, radius, spacing } from '@/lib/theme';

interface RawListing {
  id: string;
  title: string;
  type: string;
  priceAmount?: number | string | null;
  priceCurrency?: string | null;
  createdAt: string;
}

export default function Search() {
  const [q, setQ] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['listings', 'search', q],
    queryFn: async () => {
      const res = await getApi().listings.search({ q: q || undefined, limit: 30 });
      return res.items as unknown as RawListing[];
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Qidiruv</Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Kvartira, ish, xizmat…"
          placeholderTextColor={colors.dim}
          style={styles.input}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListHeaderComponent={
          data ? (
            <Text style={styles.resultsText}>
              {data.length} ta natija{q ? ` «${q}»` : ''}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={styles.emptyText}>Hech narsa topilmadi</Text>
            </View>
          )
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.md },
  title: { color: colors.fg, fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    color: colors.fg,
    fontSize: 15,
  },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  resultsText: { color: colors.muted, fontSize: 12, marginBottom: spacing.md, letterSpacing: 0.4 },
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  emptyText: { color: colors.muted, fontSize: 14 },
});
