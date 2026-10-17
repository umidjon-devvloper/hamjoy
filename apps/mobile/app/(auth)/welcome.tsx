import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Scrim } from '@/components/Scrim';
import { Icon } from '@/components/ui';
import { photos } from '@/lib/images';
import { colors, radius, type } from '@/lib/theme';

const SLIDES = [
  {
    img: photos.hovliZamonaviy,
    mark: '12k',
    badgeTitle: 'Tekshirilgan eʼlonlar',
    badgeSub: 'Har kuni yangilanadi',
    title: 'Orzuingizdagi uy — bir necha bosishda',
    text: 'Sotuv, ijara va kunlik uylar bitta ilovada. Narx, tuman va xonalar boʻyicha tez saralang.',
  },
  {
    img: photos.ishQuruvchi,
    mark: 'Ish',
    badgeTitle: 'Kunlik ish va vakansiyalar',
    badgeSub: 'Yaqin atrofingizda',
    title: 'Bugunning oʻzida ish toping',
    text: 'Kunlik ishlar va doimiy vakansiyalar. Bir bosishda ariza yuboring va natijani kuzating.',
  },
  {
    img: photos.villa2,
    mark: '✓',
    badgeTitle: 'Toʻgʻridan-toʻgʻri aloqa',
    badgeSub: 'Vositachisiz',
    title: 'Egasi bilan bevosita gaplashing',
    text: 'Ilova ichidagi chat orqali savol bering, koʻrishga kelishing va kelishuvni tezlashtiring.',
  },
];

export default function Welcome() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const s = SLIDES[i]!;
  const last = i === SLIDES.length - 1;
  const toLogin = () => router.push('/(auth)/login');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.hero}>
        <Image source={s.img} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
        <Scrim from={0} to={0.3} max={0.35} reverse />
        <View style={styles.brand}>
          <Image source={photos.logo} style={styles.logo} contentFit="cover" />
          <Text style={styles.brandText}>HAMJOY</Text>
        </View>
        <Pressable onPress={toLogin} style={styles.skip} accessibilityRole="button">
          <Text style={styles.skipText}>Oʻtkazib yuborish</Text>
        </Pressable>
        <View style={styles.badge}>
          <View style={styles.badgeMark}>
            <Text style={styles.badgeMarkText}>{s.mark}</Text>
          </View>
          <View>
            <Text style={styles.badgeTitle}>{s.badgeTitle}</Text>
            <Text style={styles.badgeSub}>{s.badgeSub}</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{s.title}</Text>
        <Text style={styles.text}>{s.text}</Text>
        <View style={styles.footer}>
          <View style={styles.dots} accessibilityLabel={`${i + 1}-qadam, jami ${SLIDES.length}`}>
            {SLIDES.map((_, d) => (
              <View key={d} style={[styles.dot, d === i && styles.dotOn]} />
            ))}
          </View>
          {last ? (
            <Pressable onPress={toLogin} style={({ pressed }) => [styles.start, pressed && { opacity: 0.85 }]}>
              <Text style={styles.startText}>Boshlash</Text>
              <View style={styles.startArrow}>
                <Icon name="arrow-right" size={20} />
              </View>
            </Pressable>
          ) : (
            <Pressable
              accessibilityLabel="Keyingi"
              onPress={() => setI(i + 1)}
              style={({ pressed }) => [styles.next, pressed && { opacity: 0.85 }]}
            >
              <Icon name="arrow-right" size={24} color={colors.white} />
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  hero: { flex: 1, marginHorizontal: 10, marginTop: 6, borderRadius: 36, overflow: 'hidden', backgroundColor: colors.photo },
  brand: { position: 'absolute', top: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 32, height: 32, borderRadius: 10 },
  brandText: { color: colors.white, fontWeight: '800', letterSpacing: 1 },
  skip: {
    position: 'absolute', top: 14, right: 14, height: 38, paddingHorizontal: 14, borderRadius: radius.pill,
    backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, justifyContent: 'center',
  },
  skipText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  badge: {
    position: 'absolute', left: 16, bottom: 16, flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingLeft: 10, paddingRight: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.94)',
  },
  badgeMark: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  badgeMarkText: { color: colors.green, fontWeight: '800', fontSize: 13 },
  badgeTitle: { fontWeight: '700', fontSize: 14, color: colors.ink },
  badgeSub: { fontSize: 12, color: colors.muted },
  body: { paddingHorizontal: 26, paddingTop: 26, paddingBottom: 18, gap: 12 },
  title: { ...type.h1, fontSize: 32, lineHeight: 34 },
  text: { fontSize: 16, color: colors.muted, lineHeight: 23 },
  footer: { marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotOn: { width: 26, backgroundColor: colors.ink },
  next: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  start: {
    flexDirection: 'row', alignItems: 'center', gap: 10, height: 58, paddingLeft: 24, paddingRight: 10,
    borderRadius: radius.pill, backgroundColor: colors.ink,
  },
  startText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  startArrow: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
});
