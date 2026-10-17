import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, ScreenHeader, type IconName } from '@/components/ui';
import { colors, radius, type } from '@/lib/theme';

interface Note {
  icon: IconName;
  tone: 'mint' | 'gold' | 'soft';
  title: string;
  text: string;
  time: string;
  unread?: boolean;
}

const GROUPS: { title: string; items: Note[] }[] = [
  {
    title: 'Bugun',
    items: [
      { icon: 'trending-down', tone: 'mint', title: 'Narx tushdi', text: '3 xonali kvartira, Yunusobod — $92 000 → $89 000', time: '10:24', unread: true },
      { icon: 'message-circle', tone: 'gold', title: 'Yangi xabar', text: 'Dilshod A.: “Ertaga soat 11 da koʻrishga kelsangiz boʻladi”', time: '09:02', unread: true },
    ],
  },
  {
    title: 'Shu hafta',
    items: [
      { icon: 'check-circle', tone: 'mint', title: 'Eʼloningiz tasdiqlandi', text: 'Eʼlon moderatsiyadan oʻtdi va endi hammaga koʻrinadi.', time: 'Dush' },
      { icon: 'briefcase', tone: 'soft', title: 'Arizangiz koʻrildi', text: 'Golden House — Sotuv menejeri vakansiyasi', time: 'Yak' },
      { icon: 'home', tone: 'soft', title: 'Yangi mos eʼlonlar', text: 'Chilonzor, 2–3 xona: 4 ta yangi eʼlon', time: 'Shan' },
    ],
  },
];

const TONES = {
  mint: { bg: colors.mint, fg: colors.green },
  gold: { bg: colors.goldSoft, fg: colors.goldInk },
  soft: { bg: colors.field, fg: colors.ink },
};

export default function Notifications() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <ScreenHeader title="Bildirishnomalar" />
        {GROUPS.map((g) => (
          <View key={g.title} style={styles.group}>
            <Text style={type.label}>{g.title.toUpperCase()}</Text>
            <View style={styles.card}>
              {g.items.map((n, i) => (
                <View key={n.title} style={[styles.row, i > 0 && styles.rowBorder]}>
                  <View style={[styles.icon, { backgroundColor: TONES[n.tone].bg }]}>
                    <Icon name={n.icon} size={18} color={TONES[n.tone].fg} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={styles.titleRow}>
                      <Text style={styles.title}>{n.title}</Text>
                      <Text style={styles.time}>{n.time}</Text>
                    </View>
                    <Text style={styles.text}>{n.text}</Text>
                  </View>
                  {n.unread ? <View style={styles.unread} /> : null}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  group: { paddingHorizontal: 20, marginTop: 10, gap: 10 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', gap: 12, padding: 16, alignItems: 'flex-start' },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.hairline },
  icon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  title: { fontWeight: '700', fontSize: 15, color: colors.ink },
  time: { fontSize: 12, color: colors.muted },
  text: { fontSize: 14, color: colors.muted, lineHeight: 19 },
  unread: { position: 'absolute', top: 18, left: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gold },
});
