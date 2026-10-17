import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing } from '../lib/theme';

interface Props {
  id: string;
  title: string;
  priceAmount?: number | null;
  priceCurrency?: string | null;
  type?: string;
  createdAt?: string;
}

const typeLabel: Record<string, string> = {
  rent: 'Ijara',
  sale: 'Sotuv',
  job: 'Ish',
  service: 'Xizmat',
};

function formatPrice(amount: number, currency: string): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ${currency}`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}k ${currency}`;
  return `${amount} ${currency}`;
}

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const diffSec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return 'hozirgina';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} daq oldin`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} soat oldin`;
  return `${Math.floor(diffSec / 86400)} kun oldin`;
}

export function ListingCard({ id, title, priceAmount, priceCurrency, type, createdAt }: Props) {
  const router = useRouter();
  const price = priceAmount && priceCurrency ? formatPrice(Number(priceAmount), priceCurrency) : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/listing/${id}`)}
    >
      {type ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{typeLabel[type] ?? type}</Text>
        </View>
      ) : null}
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      {price ? <Text style={styles.price}>{price}</Text> : null}
      <Text style={styles.meta}>{timeAgo(createdAt)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 6,
  },
  pressed: { opacity: 0.85 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginBottom: 4,
  },
  badgeText: { color: colors.accent, fontSize: 11, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
  title: { color: colors.fg, fontSize: 16, fontWeight: '600', letterSpacing: -0.2 },
  price: { color: colors.teal, fontSize: 18, fontWeight: '700' },
  meta: { color: colors.dim, fontSize: 12 },
});
