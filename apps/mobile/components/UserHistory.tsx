import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui';
import { API_URL } from '@/lib/api';
import { colors, radius, type } from '@/lib/theme';

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

const STATUS_LABEL: Record<string, { label: string; bg: string; fg: string }> = {
  active:   { label: 'Faol',    bg: colors.mint,     fg: colors.green },
  sold:     { label: 'Sotildi', bg: colors.goldWash, fg: colors.goldInk },
  archived: { label: 'Arxiv',   bg: colors.field,    fg: colors.muted },
  draft:    { label: 'Qoralama', bg: colors.field,   fg: colors.muted },
};

const VERTICAL_LABEL: Record<string, string> = {
  'uy-joy': 'Uy-joy',
  ish: 'Ish',
};

/** User history: e'lonlar tarixi — tab bilan filter. */
export function UserHistory({ userId }: { userId: string }) {
  const router = useRouter();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [tab, setTab] = useState<Tab>('all');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void fetch(`${API_URL}/users/${userId}/history`)
      .then((r) => (r.ok ? r.json() : []))
      .then((r: HistoryRow[]) => {
        setRows(Array.isArray(r) ? r : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [userId]);

  const counts = {
    all: rows.length,
    active: rows.filter((r) => r.status === 'active').length,
    sold: rows.filter((r) => r.status === 'sold').length,
    archived: rows.filter((r) => r.status === 'archived').length,
  };
  const filtered = tab === 'all' ? rows : rows.filter((r) => r.status === tab);

  const TABS: Tab[] = ['all', 'active', 'sold', 'archived'];

  return (
    <View style={styles.block}>
      <Text style={[type.h3, { marginBottom: 2 }]}>Eʼlonlar tarixi</Text>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabOn]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>
              {t === 'all' ? 'Hammasi' : STATUS_LABEL[t].label} {counts[t]}
            </Text>
          </Pressable>
        ))}
      </View>

      {!loaded ? (
        <Text style={type.small}>Yuklanmoqda…</Text>
      ) : filtered.length === 0 ? (
        <Text style={type.small}>Bu boʻlimda hali eʼlon yoʻq.</Text>
      ) : (
        <View style={{ gap: 8 }}>
          {filtered.slice(0, 20).map((r) => {
            const s = STATUS_LABEL[r.status] ?? STATUS_LABEL.archived;
            const price =
              r.priceAmount && r.priceCurrency
                ? `${Number(r.priceAmount).toLocaleString('uz-UZ')} ${r.priceCurrency}`
                : null;
            const href = (r.vertical === 'ish' ? `/job/${r.id}` : `/listing/${r.id}`) as `/listing/${string}` | `/job/${string}`;
            return (
              <Pressable
                key={r.id}
                onPress={() => router.push(href)}
                style={styles.item}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {r.title}
                  </Text>
                  <Text style={type.small} numberOfLines={1}>
                    {VERTICAL_LABEL[r.vertical] ?? r.vertical}
                    {price ? ` · ${price}` : ''}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.badgeText, { color: s.fg }]}>{s.label}</Text>
                </View>
                <Icon name="chevron-right" size={18} color={colors.dim} />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 10, padding: 16, borderRadius: 24, backgroundColor: colors.surface },
  tabs: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 2 },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.ground,
  },
  tabOn: { backgroundColor: colors.green },
  tabText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  tabTextOn: { color: colors.white },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.ground,
  },
  itemTitle: { fontSize: 14, fontWeight: '700', color: colors.ink },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { fontSize: 11, fontWeight: '800' },
});
