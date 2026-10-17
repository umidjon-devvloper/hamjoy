import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { closeSocket } from '@/lib/socket';
import { colors, radius, spacing } from '@/lib/theme';

export default function Profile() {
  const { me, logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Chiqish', "Haqiqatan ham tizimdan chiqmoqchimisiz?", [
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

  if (!me) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Yuklanmoqda…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(me.profile?.fullName ?? 'J').trim().charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{me.profile?.fullName ?? 'Yangi foydalanuvchi'}</Text>
          <Text style={styles.role}>
            {me.user.role === 'admin' ? 'Administrator' : 'Foydalanuvchi'}
          </Text>
        </View>

        <View style={styles.card}>
          <Row label="Telefon" value={me.user.phone ?? '—'} />
          <Row label="Email" value={me.user.email ?? '—'} />
          <Row label="ID" value={me.user.id} mono last />
        </View>

        <Pressable style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.75 }]} onPress={confirmLogout}>
          <Text style={styles.logoutText}>Chiqish</Text>
        </Pressable>

        <Text style={styles.version}>Joymee mobile · v0.1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  mono,
  last,
}: {
  label: string;
  value: string;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && styles.mono]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', paddingVertical: spacing.xl, gap: 6 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.accent,
  },
  avatarText: { color: colors.accent, fontSize: 28, fontWeight: '700' },
  name: { color: colors.fg, fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  role: { color: colors.muted, fontSize: 13 },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.line,
    borderRadius: radius.lg,
    marginTop: spacing.xl,
    overflow: 'hidden',
  },
  row: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.lg },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  rowLabel: { color: colors.muted, fontSize: 13 },
  rowValue: { color: colors.fg, fontSize: 14, flex: 1, textAlign: 'right' },
  mono: { fontFamily: 'Menlo', fontSize: 11 },

  logoutBtn: {
    marginTop: spacing.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.rose,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: colors.rose, fontSize: 15, fontWeight: '600' },

  version: { color: colors.dim, textAlign: 'center', fontSize: 11, marginTop: spacing.xl, letterSpacing: 0.4 },
  loading: { color: colors.muted, textAlign: 'center', marginTop: spacing.xxl },
});
