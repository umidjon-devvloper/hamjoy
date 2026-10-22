import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SaveButton } from '@/components/cards';
import { Photo } from '@/components/Photo';
import { Scrim } from '@/components/Scrim';
import { SellerReviews } from '@/components/SellerReviews';
import { Avatar, BackButton, Button, EmptyState, Icon, Pill, RoundButton, FocusStatusBar } from '@/components/ui';
import { getApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { DEAL_LABEL, timeAgo, useHome } from '@/lib/data';
import { colors, radius, type } from '@/lib/theme';

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { me } = useAuth();
  const { data: home, isLoading } = useHome(id);
  const [photo, setPhoto] = useState(0);
  const [more, setMore] = useState(false);

  const chat = useMutation({
    mutationFn: async () => await getApi().chats.start(id),
    onSuccess: (c) => router.push(`/chat/${c.id}`),
    onError: (err) => Alert.alert('Chat ochilmadi', (err as Error).message),
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.green} />
      </View>
    );
  }
  if (!home) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 12, paddingHorizontal: 20 }]}>
        <BackButton />
        <EmptyState icon="alert-circle" title="Eʼlon topilmadi" text="U oʻchirilgan yoki muddati tugagan boʻlishi mumkin." />
      </View>
    );
  }

  const isOwn = Boolean(me && home.userId === me.user.id);
  const write = () => {
    if (home.isDemo) {
      Alert.alert('Namuna eʼlon', 'Bu namuna eʼlon — egasi bilan chat ochilmaydi.');
      return;
    }
    chat.mutate();
  };

  return (
    <View style={styles.container}>
      <FocusStatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Photo key={photo} seed={home.id} source={home.images[photo]} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          <Scrim from={0} to={0.25} max={0.4} reverse />
          <Scrim from={0.7} max={0.35} />
          <View style={[styles.heroTop, { top: insets.top + 8 }]}>
            <BackButton tone="glass" />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <RoundButton icon="share" label="Ulashish" tone="glass" onPress={() => Share.share({ message: `${home.title} — ${home.price} ${home.unit}`.trim() })} />
              <SaveButton id={home.id} size={46} />
            </View>
          </View>
          {home.images.length > 1 ? (
            <View style={styles.thumbs}>
              {home.images.map((img, i) => (
                <Pressable
                  key={i}
                  accessibilityLabel={`${i + 1}-rasm`}
                  onPress={() => setPhoto(i)}
                  style={[styles.thumb, i === photo && styles.thumbOn]}
                >
                  <Photo seed={home.id + i} source={img} style={StyleSheet.absoluteFill} contentFit="cover" />
                </Pressable>
              ))}
            </View>
          ) : null}
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {photo + 1} / {home.images.length}
            </Text>
          </View>
        </View>

        <View style={styles.sheet}>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              <Pill label={DEAL_LABEL[home.deal]} tone="green" />
              {home.top ? <Pill label="TOP" tone="gold" strong /> : null}
              {home.isDemo ? <Pill label="Namuna" tone="mint" /> : null}
            </View>
            <Text style={styles.title}>{home.title}</Text>
            <View style={styles.meta}>
              <Icon name="map-pin" size={15} color={colors.muted} />
              <Text style={type.small}>
                {home.district} · {timeAgo(home.postedAt)}
              </Text>
            </View>
          </View>

          {home.specs.length > 0 ? (
            <View style={styles.specs}>
              {home.specs.map((s) => (
                <View key={s.label} style={styles.spec}>
                  <Text style={styles.specLabel}>{s.label}</Text>
                  <Text style={[styles.specValue, type.num]} numberOfLines={1} adjustsFontSizeToFit>
                    {s.value}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {home.description ? (
            <View style={{ gap: 8 }}>
              <Text style={type.h3}>Tavsif</Text>
              <Text style={styles.desc} numberOfLines={more ? undefined : 4}>
                {home.description}
              </Text>
              {home.description.length > 160 ? (
                <Pressable onPress={() => setMore(!more)} hitSlop={6}>
                  <Text style={styles.more}>{more ? 'Qisqartirish' : 'Batafsil oʻqish'}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {home.features.length > 0 ? (
            <View style={{ gap: 10 }}>
              <Text style={type.h3}>Qulayliklar</Text>
              <View style={styles.features}>
                {home.features.map((f) => (
                  <View key={f} style={styles.feature}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.map}>
            {Array.from({ length: 8 }, (_, i) => (
              <View key={`h${i}`} style={[styles.gridLine, { top: i * 30, left: 0, right: 0, height: 1 }]} />
            ))}
            {Array.from({ length: 14 }, (_, i) => (
              <View key={`v${i}`} style={[styles.gridLine, { left: i * 30, top: 0, bottom: 0, width: 1 }]} />
            ))}
            <View style={styles.road} />
            <View style={styles.pinHalo}>
              <View style={styles.pin} />
            </View>
            <View style={styles.mapLabel}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.ink }}>{home.district}</Text>
            </View>
          </View>

          <View style={styles.owner}>
            <Avatar name={home.owner} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', color: colors.ink, fontSize: 15 }}>{home.owner}</Text>
              <Text style={type.small}>Mulkdor · tasdiqlangan raqam</Text>
            </View>
            {!isOwn ? <RoundButton icon="message-circle" label="Yozish" onPress={write} style={{ backgroundColor: colors.mint }} /> : null}
          </View>

          {home.userId ? <SellerReviews sellerUserId={home.userId} listingId={home.id} /> : null}

          <View style={styles.warn}>
            <Icon name="shield" size={18} color={colors.goldInk} />
            <Text style={styles.warnText}>Uyni koʻrmasdan va hujjatlarni tekshirmasdan oldindan pul oʻtkazmang.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.barLabel}>Narxi</Text>
          <Text style={[styles.barPrice, type.num]} numberOfLines={1} adjustsFontSizeToFit>
            {home.price}
            {home.unit ? <Text style={styles.barUnit}> {home.unit}</Text> : null}
          </Text>
        </View>
        {isOwn ? (
          <Button label="Mening eʼlonim" tone="outline" size="md" style={{ height: 56 }} />
        ) : (
          <>
            <Button label="Yozish" tone="outline" size="md" style={{ height: 56, paddingHorizontal: 18 }} onPress={write} loading={chat.isPending} />
            <Button
              label="Qoʻngʻiroq"
              icon="phone"
              tone="green"
              size="md"
              style={{ height: 56 }}
              onPress={() => Alert.alert('Qoʻngʻiroq', home.isDemo ? 'Namuna eʼlon: raqam ulanmagan.' : 'Raqam chat orqali soʻraladi.')}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  center: { alignItems: 'center', justifyContent: 'center' },
  hero: { height: 440, backgroundColor: colors.photo },
  heroTop: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  thumbs: { position: 'absolute', left: 16, bottom: 44, flexDirection: 'row', gap: 6 },
  thumb: { width: 46, height: 46, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  thumbOn: { borderColor: colors.white },
  counter: {
    position: 'absolute', right: 16, bottom: 44, height: 30, paddingHorizontal: 12, borderRadius: radius.pill,
    backgroundColor: 'rgba(14,20,17,0.55)', justifyContent: 'center',
  },
  counterText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  sheet: {
    marginTop: -28, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: colors.ground,
    paddingHorizontal: 20, paddingTop: 22, gap: 20,
  },
  title: { fontSize: 26, lineHeight: 29, letterSpacing: -0.9, fontWeight: '800', color: colors.ink, marginTop: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  specs: { flexDirection: 'row', gap: 8 },
  spec: { flex: 1, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 18, backgroundColor: colors.surface, gap: 2 },
  specLabel: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  specValue: { fontSize: 18, fontWeight: '800', color: colors.ink },
  desc: { fontSize: 15, lineHeight: 24, color: colors.inkSoft },
  more: { fontWeight: '700', color: colors.green, fontSize: 15 },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.surface },
  featureDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  featureText: { fontSize: 14, fontWeight: '600', color: colors.ink },
  map: { height: 150, borderRadius: 24, overflow: 'hidden', backgroundColor: '#E9EEE6' },
  gridLine: { position: 'absolute', backgroundColor: '#DFE6DB' },
  road: { position: 'absolute', left: -40, right: -40, top: '52%', height: 14, backgroundColor: colors.white, transform: [{ rotate: '-8deg' }] },
  pinHalo: {
    position: 'absolute', left: '50%', top: '44%', marginLeft: -22, marginTop: -22, width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(31,107,63,0.18)', alignItems: 'center', justifyContent: 'center',
  },
  pin: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.green, borderWidth: 3, borderColor: colors.white },
  mapLabel: { position: 'absolute', left: 12, bottom: 12, height: 34, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.white, justifyContent: 'center' },
  owner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 24, backgroundColor: colors.surface },
  warn: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 18, backgroundColor: colors.goldWash, marginBottom: 8 },
  warnText: { flex: 1, fontSize: 13, color: colors.goldInk, lineHeight: 18 },
  bar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingTop: 12, backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(14,20,17,0.12)',
  },
  barLabel: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  barPrice: { fontSize: 22, fontWeight: '800', letterSpacing: -0.7, color: colors.ink },
  barUnit: { fontSize: 12, fontWeight: '500', color: colors.muted, letterSpacing: 0 },
});
