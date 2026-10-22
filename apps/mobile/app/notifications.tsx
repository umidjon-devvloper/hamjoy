import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, ScreenHeader, type IconName } from '@/components/ui';
import { notificationsApi, type AppNotification } from '@/lib/reviews';
import { getSocket } from '@/lib/socket';
import { colors, radius, type } from '@/lib/theme';

const KIND_ICON: Record<string, IconName> = {
  review_received: 'star',
  message: 'message-circle',
  application: 'briefcase',
  application_update: 'check-circle',
  job_match: 'target',
  listing_sold: 'tag',
  system: 'bell',
};

const KIND_TONE: Record<string, { bg: string; fg: string }> = {
  review_received: { bg: colors.goldWash, fg: colors.goldInk },
  message: { bg: colors.mint, fg: colors.green },
  application: { bg: colors.field, fg: colors.ink },
  application_update: { bg: colors.mint, fg: colors.green },
  job_match: { bg: colors.goldWash, fg: colors.goldInk },
  listing_sold: { bg: colors.goldWash, fg: colors.goldInk },
  system: { bg: colors.field, fg: colors.muted },
};

function titleFor(n: AppNotification): string {
  switch (n.type) {
    case 'review_received':
      return 'Yangi baho';
    case 'message':
      return 'Yangi xabar';
    case 'application':
      return 'Yangi ariza';
    case 'application_update':
      return 'Ariza holati yangilandi';
    case 'job_match':
      return 'Mos vakansiya';
    case 'listing_sold':
      return "E'lon sotildi";
    default:
      return 'Bildirishnoma';
  }
}

function bodyFor(n: AppNotification): string {
  const p = n.payload ?? {};
  switch (n.type) {
    case 'review_received': {
      const rating = (p as { rating?: number }).rating ?? 0;
      const preview = ((p as { preview?: string | null }).preview ?? '').trim();
      const base = `${rating} yulduz`;
      return preview ? `${base} · "${preview}"` : base;
    }
    case 'message':
      return ((p as { body?: string }).body ?? '').trim() || 'Chatni oching';
    default:
      return '';
  }
}

function linkFor(n: AppNotification): `/chat/${string}` | `/listing/${string}` | `/job/${string}` | null {
  const p = n.payload ?? {};
  switch (n.type) {
    case 'message': {
      const chatId = (p as { chatId?: string }).chatId;
      return chatId ? (`/chat/${chatId}` as `/chat/${string}`) : null;
    }
    case 'listing_sold':
    case 'review_received': {
      const id = (p as { listingId?: string }).listingId;
      return id ? (`/listing/${id}` as `/listing/${string}`) : null;
    }
    default:
      return null;
  }
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} daq oldin`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} soat oldin`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} kun oldin`;
  return new Date(iso).toLocaleDateString('uz-UZ');
}

function groupByBucket(items: AppNotification[]) {
  const today: AppNotification[] = [];
  const week: AppNotification[] = [];
  const older: AppNotification[] = [];
  const now = Date.now();
  for (const n of items) {
    const diff = (now - new Date(n.createdAt).getTime()) / (24 * 60 * 60 * 1000);
    if (diff < 1) today.push(n);
    else if (diff < 7) week.push(n);
    else older.push(n);
  }
  return [
    { title: 'Bugun', items: today },
    { title: 'Shu hafta', items: week },
    { title: 'Oldinroq', items: older },
  ].filter((g) => g.items.length > 0);
}

export default function Notifications() {
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const data = await notificationsApi.list();
    setItems(data);
    setLoaded(true);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Real-time: refresh the list whenever the server pushes a new one.
  useEffect(() => {
    let sockRef: Awaited<ReturnType<typeof getSocket>> | null = null;
    let cancelled = false;
    void (async () => {
      const sock = await getSocket();
      if (cancelled || !sock) return;
      sockRef = sock;
      sock.on('notification:new', () => {
        void load();
      });
    })();
    return () => {
      cancelled = true;
      sockRef?.off('notification:new');
    };
  }, [load]);

  const groups = useMemo(() => groupByBucket(items), [items]);
  const unread = items.some((n) => !n.readAt);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onPressNote = async (n: AppNotification) => {
    if (!n.readAt) {
      await notificationsApi.markRead(n.id);
      setItems((xs) => xs.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
    }
    const href = linkFor(n);
    if (href) router.push(href);
  };

  const markAll = async () => {
    await notificationsApi.markAllRead();
    const now = new Date().toISOString();
    setItems((xs) => xs.map((x) => ({ ...x, readAt: x.readAt ?? now })));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />}
      >
        <ScreenHeader
          title="Bildirishnomalar"
          right={
            unread ? (
              <Pressable onPress={markAll} hitSlop={8}>
                <Text style={styles.markAll}>Hammasini oʻqilgan</Text>
              </Pressable>
            ) : null
          }
        />

        {!loaded ? (
          <Text style={[type.small, { paddingHorizontal: 20 }]}>Yuklanmoqda…</Text>
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="bell" size={32} color={colors.muted} />
            <Text style={styles.emptyTitle}>Hali bildirishnoma yoʻq</Text>
            <Text style={type.small}>Yangi sharhlar, xabarlar va yangilanishlar shu yerda chiqadi.</Text>
          </View>
        ) : (
          groups.map((g) => (
            <View key={g.title} style={styles.group}>
              <Text style={type.label}>{g.title.toUpperCase()}</Text>
              <View style={styles.card}>
                {g.items.map((n, i) => {
                  const tone = KIND_TONE[n.type] ?? KIND_TONE.system;
                  const icon: IconName = KIND_ICON[n.type] ?? 'bell';
                  return (
                    <Pressable key={n.id} onPress={() => onPressNote(n)} style={[styles.row, i > 0 && styles.rowBorder]}>
                      <View style={[styles.icon, { backgroundColor: tone.bg }]}>
                        <Icon name={icon} size={18} color={tone.fg} />
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <View style={styles.titleRow}>
                          <Text style={styles.title}>{titleFor(n)}</Text>
                          <Text style={styles.time}>{timeAgo(n.createdAt)}</Text>
                        </View>
                        {bodyFor(n) ? <Text style={styles.text}>{bodyFor(n)}</Text> : null}
                      </View>
                      {!n.readAt ? <View style={styles.unread} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  markAll: { fontSize: 13, fontWeight: '700', color: colors.green },
  group: { paddingHorizontal: 20, marginTop: 10, gap: 10 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', gap: 12, padding: 16, alignItems: 'flex-start' },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.hairline },
  icon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  title: { fontWeight: '700', fontSize: 15, color: colors.ink },
  time: { fontSize: 12, color: colors.muted },
  text: { fontSize: 14, color: colors.muted, lineHeight: 19 },
  unread: { position: 'absolute', top: 18, right: 14, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 36, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
});
