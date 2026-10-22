import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon, Button } from '@/components/ui';
import { reviewsApi, type Review, type UserStats } from '@/lib/reviews';
import { useAuth } from '@/lib/auth';
import { colors, radius, type } from '@/lib/theme';

export function StarRow({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  const rounded = Math.round(value * 10) / 10;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon
          key={n}
          name="star"
          size={size}
          color={n <= Math.round(value) ? colors.gold : colors.border}
        />
      ))}
      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.ink, marginLeft: 4 }}>
        {rounded.toFixed(rounded % 1 === 0 ? 0 : 1)}
      </Text>
      {count != null ? (
        <Text style={{ fontSize: 12, color: colors.muted }}>· {count}</Text>
      ) : null}
    </View>
  );
}

/**
 * Sotuvchi haqida sharhlar bloki: statistika, ro'yxat, va kirgan foydalanuvchi
 * uchun forma (o'z e'loniga baho qoldirib bo'lmaydi).
 */
export function SellerReviews({ sellerUserId, listingId }: { sellerUserId: string; listingId?: string }) {
  const { me } = useAuth();
  const [stats, setStats] = useState<UserStats>({ avg: 0, count: 0 });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    void reviewsApi.stats(sellerUserId).then(setStats);
    void reviewsApi.list(sellerUserId).then(setReviews);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerUserId]);

  const canReview = Boolean(me?.user?.id) && me?.user?.id !== sellerUserId;

  const submit = async () => {
    setBusy(true);
    try {
      await reviewsApi.create({
        toUserId: sellerUserId,
        listingId,
        rating,
        comment: comment.trim() || undefined,
      });
      setComment('');
      refresh();
      Alert.alert('Rahmat', 'Baho qoldirildi');
    } catch (err) {
      Alert.alert('Xatolik', (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.block}>
      <View style={styles.header}>
        <Text style={type.h3}>Sotuvchi haqida</Text>
        <StarRow value={stats.avg} count={stats.count} />
      </View>

      {canReview ? (
        <View style={styles.form}>
          <Text style={styles.formLabel}>Baho qoldiring</Text>
          <View style={styles.starPicker}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setRating(n)} hitSlop={6} style={{ padding: 4 }}>
                <Icon name="star" size={28} color={n <= rating ? colors.gold : colors.border} />
              </Pressable>
            ))}
          </View>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Qisqa izoh (ixtiyoriy)…"
            placeholderTextColor={colors.dim}
            multiline
            maxLength={500}
            style={styles.input}
          />
          <Button label={busy ? 'Yuborilmoqda…' : 'Baho qoldirish'} tone="green" onPress={submit} loading={busy} />
        </View>
      ) : null}

      {reviews.length === 0 ? (
        <Text style={[type.small, { marginTop: 4 }]}>Hali baho yoʻq.</Text>
      ) : (
        <View style={{ gap: 10 }}>
          {reviews.slice(0, 10).map((r) => (
            <View key={r.id} style={styles.item}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <StarRow value={r.rating} size={12} />
                <Text style={type.small}>{new Date(r.createdAt).toLocaleDateString('uz-UZ')}</Text>
              </View>
              {r.comment ? <Text style={styles.comment}>{r.comment}</Text> : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 12, padding: 16, borderRadius: 24, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  form: {
    gap: 10,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  formLabel: { fontSize: 13, fontWeight: '700', color: colors.ink },
  starPicker: { flexDirection: 'row', gap: 2 },
  input: {
    minHeight: 54,
    maxHeight: 110,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.field,
    fontSize: 14,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  item: { padding: 12, borderRadius: 16, backgroundColor: colors.ground, gap: 6 },
  comment: { fontSize: 14, lineHeight: 20, color: colors.inkSoft },
});
