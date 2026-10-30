import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton, Button, EmptyState, Icon, FocusStatusBar } from '@/components/ui';
import { listingsApi } from '@/lib/reviews';
import { useAuth } from '@/lib/auth';
import { colors, radius, TAB_BAR_SPACE, type } from '@/lib/theme';

interface HistoryRow {
  id: string;
  title: string;
  type: string;
  vertical: string;
  status: string;
  priceAmount: string | null;
  priceCurrency: string | null;
  createdAt: string;
}

type Tab = 'all' | 'active' | 'sold' | 'archived';

const STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  active:   { label: 'Faol',    bg: colors.mint,     fg: colors.green },
  sold:     { label: 'Sotildi', bg: colors.goldWash, fg: colors.goldInk },
  archived: { label: 'Arxiv',   bg: colors.field,    fg: colors.muted },
  draft:    { label: 'Qoralama', bg: colors.field,   fg: colors.muted },
};

const VERTICAL_LABEL: Record<string, string> = {
  'uy-joy': 'Uy-joy',
  ish: 'Ish',
};

export default function MyListings() {
  const router = useRouter();
  const { me } = useAuth();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [tab, setTab] = useState<Tab>('all');
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!me?.user?.id) return;
    const data = await listingsApi.myHistory(me.user.id);
    setRows([...data]);
    setLoaded(true);
  }, [me?.user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      await load();
    } catch {
      Alert.alert('Xatolik', `${name} bajarilmadi`);
    }
  };

  const onMarkSold = (id: string) =>
    Alert.alert('Sotildi deb belgilash', 'Rostdan ham?', [
      { text: 'Bekor', style: 'cancel' },
      { text: 'Ha', style: 'default', onPress: () => act('Belgilash', () => listingsApi.markSold(id)) },
    ]);
  const onReopen = (id: string) =>
    act('Qayta ochish', () => listingsApi.reopen(id));
  const onDelete = (id: string) =>
    Alert.alert('O\'chirish', 'Rostdan ham o\'chirmoqchimisiz?', [
      { text: 'Bekor', style: 'cancel' },
      { text: 'O\'chirish', style: 'destructive', onPress: () => act('O\'chirish', () => listingsApi.remove(id)) },
    ]);

  const counts = {
    all: rows.length,
    active: rows.filter((r) => r.status === 'active').length,
    sold: rows.filter((r) => r.status === 'sold').length,
    archived: rows.filter((r) => r.status === 'archived').length,
  };
  const filtered = tab === 'all' ? rows : rows.filter((r) => r.status === tab);
  const TABS: Tab[] = ['all', 'active', 'sold', 'archived'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FocusStatusBar style="dark" />
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Mening eʼlonlarim</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: TAB_BAR_SPACE + 24, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabs}>
          {TABS.map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabOn]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>
                {t === 'all' ? 'Hammasi' : STATUS[t].label} {counts[t]}
              </Text>
            </Pressable>
          ))}
        </View>

        {!loaded ? (
          <Text style={type.small}>Yuklanmoqda…</Text>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="Bu bo'limda eʼlon yoʻq"
            text="Yangi eʼlon joylab, ro'yxatda ko'ring."
          >
            <Button label="Yangi eʼlon" tone="green" onPress={() => router.push('/post')} />
          </EmptyState>
        ) : (
          <View style={{ gap: 10 }}>
            {filtered.map((r) => {
              const s = STATUS[r.status] ?? STATUS.archived;
              const price =
                r.priceAmount && r.priceCurrency
                  ? `${Number(r.priceAmount).toLocaleString('uz-UZ')} ${r.priceCurrency}`
                  : null;
              const viewHref = (r.vertical === 'ish' ? `/job/${r.id}` : `/listing/${r.id}`) as
                | `/listing/${string}`
                | `/job/${string}`;
              return (
                <View key={r.id} style={styles.card}>
                  <Pressable onPress={() => router.push(viewHref)} style={styles.cardTop}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {r.title}
                      </Text>
                      <Text style={type.small} numberOfLines={1}>
                        {VERTICAL_LABEL[r.vertical] ?? r.vertical}
                        {price ? ` · ${price}` : ''} · {new Date(r.createdAt).toLocaleDateString('uz-UZ')}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: s.bg }]}>
                      <Text style={[styles.badgeText, { color: s.fg }]}>{s.label}</Text>
                    </View>
                  </Pressable>

                  <View style={styles.actions}>
                    {r.vertical !== 'ish' ? (
                      <Pressable
                        onPress={() => router.push({ pathname: '/post', params: { edit: r.id } })}
                        style={[styles.action, { backgroundColor: colors.field }]}
                      >
                        <Icon name="edit-2" size={14} color={colors.ink} />
                        <Text style={[styles.actionText, { color: colors.ink }]}>Tahrir</Text>
                      </Pressable>
                    ) : null}
                    {r.status === 'active' ? (
                      <Pressable onPress={() => onMarkSold(r.id)} style={[styles.action, { backgroundColor: colors.goldWash }]}>
                        <Icon name="check-circle" size={14} color={colors.goldInk} />
                        <Text style={[styles.actionText, { color: colors.goldInk }]}>Sotildi</Text>
                      </Pressable>
                    ) : null}
                    {r.status === 'sold' ? (
                      <Pressable onPress={() => onReopen(r.id)} style={[styles.action, { backgroundColor: colors.mint }]}>
                        <Icon name="refresh-cw" size={14} color={colors.green} />
                        <Text style={[styles.actionText, { color: colors.green }]}>Qayta ochish</Text>
                      </Pressable>
                    ) : null}
                    <Pressable
                      onPress={() => onDelete(r.id)}
                      style={[styles.action, { backgroundColor: '#FBECEB' }]}
                    >
                      <Icon name="trash-2" size={14} color={colors.danger} />
                      <Text style={[styles.actionText, { color: colors.danger }]}>O'chirish</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.ink },
  tabs: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.surface },
  tabOn: { backgroundColor: colors.green },
  tabText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  tabTextOn: { color: colors.white },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 14, gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { fontSize: 11, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  actionText: { fontSize: 12, fontWeight: '800' },
});
