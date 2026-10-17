import { useQuery, useMutation } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { colors, radius, spacing } from '@/lib/theme';

interface RawListing {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: string;
  priceAmount?: number | string | null;
  priceCurrency?: string | null;
  createdAt: string;
}

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { me } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => (await getApi().listings.get(id)) as unknown as RawListing,
  });

  const chatMutation = useMutation({
    mutationFn: async () => await getApi().chats.start(id),
    onSuccess: (chat) => {
      router.push(`/chat/${chat.id}`);
    },
    onError: (err) => Alert.alert('Chat ochilmadi', (err as Error).message),
  });

  const isOwn = data && me ? data.userId === me.user.id : false;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>E'lon</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : error || !data ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Topilmadi</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{data.title}</Text>
          {data.priceAmount != null ? (
            <Text style={styles.price}>
              {Number(data.priceAmount).toLocaleString('uz-UZ')} {data.priceCurrency ?? 'UZS'}
            </Text>
          ) : null}
          <Text style={styles.description}>{data.description || "Tavsif qo'shilmagan"}</Text>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Turi</Text>
            <Text style={styles.cardValue}>{data.type}</Text>
          </View>

          {isOwn ? (
            <Text style={styles.ownHint}>Bu sizning e'loningiz</Text>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.cta, pressed && { opacity: 0.8 }]}
              onPress={() => chatMutation.mutate()}
              disabled={chatMutation.isPending}
            >
              {chatMutation.isPending ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <Text style={styles.ctaText}>Yozish</Text>
              )}
            </Pressable>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.line, gap: spacing.lg,
  },
  back: { color: colors.fg, fontSize: 24 },
  headerTitle: { color: colors.fg, fontSize: 17, fontWeight: '600' },
  content: { padding: spacing.xl, gap: spacing.lg },
  title: { color: colors.fg, fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  price: { color: colors.teal, fontSize: 24, fontWeight: '700' },
  description: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line,
    borderRadius: radius.lg, padding: spacing.lg,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  cardLabel: { color: colors.muted, fontSize: 13 },
  cardValue: { color: colors.fg, fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  cta: {
    backgroundColor: colors.accent, borderRadius: radius.md,
    paddingVertical: 16, alignItems: 'center',
  },
  ctaText: { color: colors.bg, fontSize: 16, fontWeight: '600' },
  ownHint: { color: colors.muted, textAlign: 'center', fontSize: 13, marginTop: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: colors.rose, fontSize: 15 },
});
