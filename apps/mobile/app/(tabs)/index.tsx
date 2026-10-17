import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeaturedCard, GigCard, HomeRow, JobCard } from '@/components/cards';
import { Scrim } from '@/components/Scrim';
import { Chip, Icon, RoundButton, SectionHeader, Segmented, FocusStatusBar } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { greeting, useHomes, useJobs, type Deal } from '@/lib/data';
import { photos } from '@/lib/images';
import { colors, radius, shadow, TAB_BAR_SPACE, type } from '@/lib/theme';

type Section = 'uyjoy' | 'ish';

const CATS: { id: Deal | 'all'; label: string }[] = [
  { id: 'all', label: 'Hammasi' },
  { id: 'sotuv', label: 'Sotuv' },
  { id: 'ijara', label: 'Ijara' },
  { id: 'kunlik', label: 'Kunlik' },
];

const SECTIONS = [
  { value: 'uyjoy' as const, label: 'Uy-joy' },
  { value: 'ish' as const, label: 'Ish' },
];

function useFirstName() {
  const { me } = useAuth();
  return me?.profile?.fullName?.trim().split(/\s+/)[0] ?? '';
}

export default function Home() {
  const [section, setSection] = useState<Section>('uyjoy');
  return section === 'uyjoy' ? <HomesFeed onSection={setSection} /> : <JobsFeed onSection={setSection} />;
}

function HomesFeed({ onSection }: { onSection: (s: Section) => void }) {
  const router = useRouter();
  const name = useFirstName();
  const [cat, setCat] = useState<Deal | 'all'>('all');
  const { data, isLoading, isRefetching, refetch } = useHomes({ deal: cat });
  const homes = data ?? [];
  const featured = homes.filter((h) => h.deal === 'sotuv' || h.top).slice(0, 5);
  const featuredList = featured.length ? featured : homes.slice(0, 5);
  const near = homes.filter((h) => !featuredList.includes(h)).slice(0, 6);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.green} />}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={type.small}>
              {greeting()}
              {name ? `, ${name}` : ''}
            </Text>
            <View style={styles.city}>
              <Icon name="map-pin" size={16} color={colors.green} />
              <Text style={styles.cityText}>Toshkent</Text>
              <Icon name="chevron-down" size={18} />
            </View>
          </View>
          <RoundButton icon="heart" label="Saqlanganlar" onPress={() => router.push('/saved')} />
          <RoundButton icon="bell" label="Bildirishnomalar" dot onPress={() => router.push('/notifications')} />
        </View>

        <View style={styles.pad}>
          <Segmented options={SECTIONS} value="uyjoy" onChange={onSection} />
        </View>

        <Pressable onPress={() => router.push('/search')} style={[styles.search, shadow.soft]}>
          <Icon name="search" size={20} color={colors.muted} />
          <View style={{ flex: 1 }}>
            <Text style={styles.searchTitle}>Qayerda yashamoqchisiz?</Text>
            <Text style={styles.searchSub}>Tuman · narx · xonalar</Text>
          </View>
          <View style={styles.searchGo}>
            <Icon name="sliders" size={18} color={colors.white} />
          </View>
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CATS.map((c) => (
            <Chip key={c.id} label={c.label} selected={cat === c.id} onPress={() => setCat(c.id)} />
          ))}
        </ScrollView>

        {isLoading ? (
          <ActivityIndicator color={colors.green} style={{ marginTop: 48 }} />
        ) : (
          <>
            <View style={[styles.pad, { marginTop: 18 }]}>
              <SectionHeader title="Tanlangan uylar" action="Hammasi" onAction={() => router.push('/search')} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={304}
              decelerationRate="fast"
              contentContainerStyle={styles.carousel}
            >
              {featuredList.map((h) => (
                <FeaturedCard key={h.id} home={h} />
              ))}
            </ScrollView>

            {near.length > 0 ? (
              <View style={[styles.pad, { marginTop: 26 }]}>
                <SectionHeader title="Yaqin atrofda" action="Hammasi" onAction={() => router.push('/search')} />
                <View style={{ gap: 10 }}>
                  {near.map((h) => (
                    <HomeRow key={h.id} home={h} />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}

        <Pressable onPress={() => router.push('/post')} style={styles.promo}>
          <Image source={photos.uyJoyHovli} style={styles.promoImg} contentFit="cover" />
          <Scrim color="15,42,28" horizontal from={0.45} to={0.8} max={1} reverse />
          <View style={styles.promoBody}>
            <Text style={styles.promoKicker}>EGALAR UCHUN</Text>
            <Text style={styles.promoTitle}>Uyingizni bir necha daqiqada joylang</Text>
            <View style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>Eʼlon joylash</Text>
            </View>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function JobsFeed({ onSection }: { onSection: (s: Section) => void }) {
  const router = useRouter();
  const name = useFirstName();
  const [q, setQ] = useState('');
  const { data, isLoading, isRefetching, refetch } = useJobs(q);
  const gigs = (data ?? []).filter((j) => j.kind === 'kunlik');
  const jobs = (data ?? []).filter((j) => j.kind === 'vakansiya');

  return (
    <View style={styles.container}>
      <FocusStatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.green} />}
      >
        <SafeAreaView edges={['top']} style={styles.jobsHero}>
          <View style={styles.jobsHeroRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.jobsHello}>
                {greeting()}
                {name ? `, ${name}` : ''}
              </Text>
              <Text style={styles.jobsTitle}>Bugun qanday ish?</Text>
            </View>
            <RoundButton icon="bell" label="Bildirishnomalar" tone="dark" dot onPress={() => router.push('/notifications')} />
          </View>
          <Segmented options={SECTIONS} value="ish" onChange={onSection} tone="dark" />
          <View style={styles.jobsSearch}>
            <Icon name="search" size={20} color={colors.muted} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Kasb, lavozim yoki kompaniya"
              placeholderTextColor={colors.dim}
              style={styles.jobsInput}
              returnKeyType="search"
              accessibilityLabel="Ish qidirish"
            />
          </View>
        </SafeAreaView>

        {isLoading ? (
          <ActivityIndicator color={colors.green} style={{ marginTop: 48 }} />
        ) : (
          <>
            {gigs.length > 0 ? (
              <View style={{ marginTop: 22 }}>
                <View style={styles.pad}>
                  <SectionHeader title="Kunlik ish · bugun" />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.carousel, { gap: 12 }]}>
                  {gigs.map((g, i) => (
                    <GigCard key={g.id} job={g} index={i} />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <View style={[styles.pad, { marginTop: 24 }]}>
              <SectionHeader title="Siz uchun vakansiyalar" />
              <View style={{ gap: 10 }}>
                {jobs.map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
                {jobs.length === 0 && gigs.length === 0 ? (
                  <Text style={[type.small, { textAlign: 'center', paddingVertical: 24 }]}>Hech narsa topilmadi</Text>
                ) : null}
              </View>
            </View>
          </>
        )}

        <View style={[styles.promo, { backgroundColor: colors.goldSoft }]}>
          <Image source={photos.ishQuruvchi} style={styles.promoImg} contentFit="cover" />
          <Scrim color="242,227,179" horizontal from={0.45} to={0.8} max={1} reverse />
          <View style={styles.promoBody}>
            <Text style={[styles.promoKicker, { color: colors.green }]}>ISH BERUVCHILAR UCHUN</Text>
            <Text style={[styles.promoTitle, { color: colors.ink }]}>Xodimni bugunoq toping</Text>
            <Pressable onPress={() => router.push('/post')} style={[styles.promoBtn, { backgroundColor: colors.ink }]}>
              <Text style={[styles.promoBtnText, { color: colors.white }]}>Vakansiya joylash</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  pad: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18 },
  city: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  cityText: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5, color: colors.ink },
  search: {
    marginTop: 14, marginHorizontal: 20, height: 60, borderRadius: radius.pill, backgroundColor: colors.surface,
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 20, paddingRight: 8,
  },
  searchTitle: { fontWeight: '700', color: colors.ink, fontSize: 15 },
  searchSub: { fontSize: 12, color: colors.muted },
  searchGo: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  chips: { gap: 8, paddingHorizontal: 20, paddingTop: 18 },
  carousel: { gap: 14, paddingHorizontal: 20, paddingBottom: 6 },
  promo: { marginTop: 26, marginHorizontal: 20, height: 168, borderRadius: 28, overflow: 'hidden', backgroundColor: colors.deep },
  promoImg: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '55%', opacity: 0.9 },
  promoBody: { padding: 20, gap: 6, maxWidth: 230 },
  promoKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1.8, color: colors.goldSoft },
  promoTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4, lineHeight: 23, color: colors.white },
  promoBtn: { alignSelf: 'flex-start', marginTop: 6, height: 40, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.goldSoft, justifyContent: 'center' },
  promoBtnText: { fontWeight: '700', fontSize: 14, color: colors.goldInk },
  jobsHero: {
    backgroundColor: colors.deep, paddingHorizontal: 20, paddingBottom: 26, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, gap: 16,
  },
  jobsHeroRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12 },
  jobsHello: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  jobsTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.6, color: colors.white },
  jobsSearch: {
    height: 56, borderRadius: radius.pill, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18,
  },
  jobsInput: { flex: 1, fontSize: 15, color: colors.ink },
});
