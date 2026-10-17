import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Icon, RoundButton, type IconName } from '@/components/ui';
import { getApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useSaved } from '@/lib/saved';
import { closeSocket } from '@/lib/socket';
import { colors, radius, TAB_BAR_SPACE, type } from '@/lib/theme';

function maskPhone(phone: string | null) {
  if (!phone) return 'Raqam qoʻshilmagan';
  const d = phone.replace(/\D/g, '');
  if (d.length < 12) return phone;
  return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} •• ••`;
}

export default function Profile() {
  const router = useRouter();
  const { me, logout } = useAuth();
  const { ids } = useSaved();
  const { data: chats } = useQuery({
    queryKey: ['chats'],
    enabled: Boolean(me),
    queryFn: async () => (await getApi().chats.list()) as unknown as { unread: number }[],
  });

  const confirmLogout = () => {
    Alert.alert('Chiqish', 'Haqiqatan ham hisobdan chiqmoqchimisiz?', [
      { text: 'Bekor qilish', style: 'cancel' },
      {
        text: 'Chiqish',
        style: 'destructive',
        onPress: async () => {
          closeSocket();
          await logout();
        },
      },
    ]);
  };

  const name = me?.profile?.fullName?.trim() || 'HamJoy foydalanuvchisi';
  const soon = () => Alert.alert('Tez orada', 'Bu boʻlim keyingi yangilanishda qoʻshiladi.');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <Text style={type.display}>Profil</Text>
          <RoundButton icon="settings" label="Sozlamalar" onPress={soon} />
        </View>

        <View style={styles.hero}>
          <View style={styles.ring1} />
          <View style={styles.ring2} />
          <View style={styles.heroRow}>
            <Avatar name={name} size={68} tone="gold" />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              <Text style={[styles.phone, type.num]}>{maskPhone(me?.user.phone ?? null)}</Text>
              <View style={styles.verified}>
                <Icon name="check-circle" size={12} color="#BFE5CC" />
                <Text style={styles.verifiedText}>{me?.user.role === 'admin' ? 'Administrator' : 'Tasdiqlangan'}</Text>
              </View>
            </View>
          </View>
          <View style={styles.stats}>
            <Stat value={ids.length} label="Saqlangan" onPress={() => router.push('/saved')} />
            <Stat value={(chats ?? []).length} label="Suhbatlar" onPress={() => router.push('/chat')} />
            <Stat value={(chats ?? []).reduce((n, c) => n + c.unread, 0)} label="Yangi xabar" onPress={() => router.push('/chat')} />
          </View>
        </View>

        <Group>
          <Row icon="plus-circle" tone="mint" label="Eʼlon joylash" onPress={() => router.push('/post')} />
          <Row icon="heart" tone="soft" label="Saqlanganlar" onPress={() => router.push('/saved')} />
          <Row icon="bell" tone="gold" label="Bildirishnomalar" onPress={() => router.push('/notifications')} last />
        </Group>

        <Group>
          <Row label="Til" value="Oʻzbekcha" onPress={soon} />
          <Row label="Yordam markazi" onPress={soon} />
          <Row label="Foydalanish shartlari" onPress={soon} />
          <Pressable onPress={confirmLogout} style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.danger, fontWeight: '700' }]}>Chiqish</Text>
          </Pressable>
        </Group>

        <Text style={styles.version}>HamJoy · v0.1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label, onPress }: { value: number; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.stat, pressed && { opacity: 0.8 }]}>
      <Text style={[styles.statValue, type.num]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

function Group({ children }: { children: ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

const ROW_TONES = {
  mint: { bg: colors.mint, fg: colors.green },
  gold: { bg: colors.goldSoft, fg: colors.goldInk },
  soft: { bg: colors.hairline, fg: colors.ink },
};

function Row({
  icon,
  tone = 'soft',
  label,
  value,
  onPress,
  last,
}: {
  icon?: IconName;
  tone?: keyof typeof ROW_TONES;
  label: string;
  value?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && { backgroundColor: colors.hairline }]}>
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: ROW_TONES[tone].bg }]}>
          <Icon name={icon} size={18} color={ROW_TONES[tone].fg} />
        </View>
      ) : null}
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={type.small}>{value}</Text> : null}
      <Icon name="chevron-right" size={18} color={colors.dim} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: TAB_BAR_SPACE, gap: 16 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hero: { padding: 22, borderRadius: radius.xl, backgroundColor: colors.deep, overflow: 'hidden' },
  ring1: { position: 'absolute', right: -60, top: -60, width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: 'rgba(242,227,179,0.16)' },
  ring2: { position: 'absolute', right: -20, top: -20, width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderColor: 'rgba(242,227,179,0.22)' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  name: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, color: colors.white },
  phone: { fontSize: 14, color: 'rgba(255,255,255,0.72)' },
  verified: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4, height: 24, paddingHorizontal: 9,
    borderRadius: radius.pill, backgroundColor: 'rgba(63,163,107,0.25)',
  },
  verifiedText: { color: '#BFE5CC', fontSize: 12, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: 8, marginTop: 18 },
  stat: { flex: 1, padding: 12, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)' },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.white },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.72)' },
  group: { borderRadius: radius.lg, backgroundColor: colors.surface, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 58, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  rowIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.ink },
  version: { textAlign: 'center', fontSize: 12, color: colors.dim, letterSpacing: 0.4 },
});
