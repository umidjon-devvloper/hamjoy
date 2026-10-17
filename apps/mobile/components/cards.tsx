import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DEAL_LABEL, type Home, type Job } from '@/lib/data';
import { useSaved } from '@/lib/saved';
import { colors, radius, shadow, type } from '@/lib/theme';
import { Photo } from './Photo';
import { Scrim } from './Scrim';
import { Icon, Pill } from './ui';

export function SaveButton({ id, tone = 'glass', size = 44 }: { id: string; tone?: 'glass' | 'light'; size?: number }) {
  const { isSaved, toggle } = useSaved();
  const on = isSaved(id);
  const glass = tone === 'glass';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={on ? 'Saqlanganlardan olib tashlash' : 'Saqlash'}
      accessibilityState={{ selected: on }}
      onPress={() => toggle(id)}
      hitSlop={6}
      style={[
        cardStyles.save,
        { width: size, height: size, borderRadius: size / 2 },
        glass ? cardStyles.saveGlass : { backgroundColor: colors.surface },
      ]}
    >
      <Icon name="heart" size={size * 0.43} color={on ? (glass ? colors.goldSoft : colors.green) : glass ? colors.white : colors.ink} />
      {on ? <View style={[cardStyles.saveDot, { backgroundColor: glass ? colors.goldSoft : colors.green }]} /> : null}
    </Pressable>
  );
}

/** Tall photo card for the "Tanlangan uylar" carousel. */
export function FeaturedCard({ home, width = 290 }: { home: Home; width?: number }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/listing/${home.id}`)}
      style={({ pressed }) => [cardStyles.featured, { width }, shadow.lift, pressed && { transform: [{ scale: 0.985 }] }]}
    >
      <Photo seed={home.id} source={home.images[0]} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      <Scrim from={0.4} max={0.86} />
      <View style={cardStyles.featuredBadges}>
        <Pill label={DEAL_LABEL[home.deal]} tone="glass" />
        {home.top ? <Pill label="TOP" tone="gold" strong /> : null}
      </View>
      <View style={cardStyles.featuredSave}>
        <SaveButton id={home.id} />
      </View>
      <View style={cardStyles.featuredBody}>
        <Text style={[cardStyles.featuredPrice, type.num]}>
          {home.price} {home.unit ? <Text style={cardStyles.featuredUnit}>{home.unit}</Text> : null}
        </Text>
        <Text style={cardStyles.featuredTitle} numberOfLines={1}>
          {home.title}
        </Text>
        <View style={cardStyles.factRow}>
          {home.facts.map((f) => (
            <View key={f} style={cardStyles.fact}>
              <Text style={cardStyles.factText}>{f}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

/** Compact horizontal row: thumbnail + text. */
export function HomeRow({ home }: { home: Home }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/listing/${home.id}`)}
      style={({ pressed }) => [cardStyles.row, pressed && { opacity: 0.85 }]}
    >
      <Photo seed={home.id} source={home.images[0]} style={cardStyles.rowImg} contentFit="cover" transition={150} />
      <View style={cardStyles.rowBody}>
        <Text style={cardStyles.rowKicker}>
          {DEAL_LABEL[home.deal].toUpperCase()}
          {home.distance ? ` · ${home.distance}` : ''}
        </Text>
        <Text style={cardStyles.rowTitle} numberOfLines={1}>
          {home.title}
        </Text>
        <Text style={type.small} numberOfLines={1}>
          {home.facts.join(' · ') || home.district}
        </Text>
        <Text style={[cardStyles.rowPrice, type.num]}>
          {home.price} {home.unit ? <Text style={cardStyles.rowUnit}>{home.unit}</Text> : null}
        </Text>
      </View>
      <View style={cardStyles.rowSave}>
        <SaveButton id={home.id} tone="light" size={36} />
      </View>
    </Pressable>
  );
}

/** Full-width photo card used in result lists. */
export function HomeTile({ home }: { home: Home }) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push(`/listing/${home.id}`)} style={({ pressed }) => [cardStyles.tile, pressed && { opacity: 0.9 }]}>
      <View style={cardStyles.tilePhoto}>
        <Photo seed={home.id} source={home.images[0]} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
        <View style={cardStyles.featuredBadges}>
          <Pill label={DEAL_LABEL[home.deal]} tone="glass" />
          {home.top ? <Pill label="TOP" tone="gold" strong /> : null}
        </View>
        <View style={cardStyles.featuredSave}>
          <SaveButton id={home.id} />
        </View>
      </View>
      <View style={cardStyles.tileBody}>
        <Text style={[cardStyles.tilePrice, type.num]}>
          {home.price} {home.unit ? <Text style={cardStyles.rowUnit}>{home.unit}</Text> : null}
        </Text>
        <Text style={cardStyles.rowTitle} numberOfLines={1}>
          {home.title}
        </Text>
        <Text style={type.small} numberOfLines={1}>
          {[home.district, ...home.facts].join(' · ')}
        </Text>
      </View>
    </Pressable>
  );
}

const GIG_BGS = [colors.goldSoft, colors.mint, '#E6E9F5'];

export function GigCard({ job, index }: { job: Job; index: number }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/job/${job.id}`)}
      style={({ pressed }) => [cardStyles.gig, { backgroundColor: GIG_BGS[index % GIG_BGS.length] }, pressed && { opacity: 0.85 }]}
    >
      <View style={cardStyles.gigTop}>
        <View style={cardStyles.gigTime}>
          <Text style={cardStyles.gigTimeText}>{job.time ?? job.mode}</Text>
        </View>
        {job.distance ? <Text style={cardStyles.gigDist}>{job.distance}</Text> : null}
      </View>
      <Text style={cardStyles.gigTitle} numberOfLines={2}>
        {job.title}
      </Text>
      <Text style={cardStyles.gigPlace}>
        {job.company} · {job.place}
      </Text>
      <Text style={[cardStyles.gigPay, type.num]}>{job.salary}</Text>
    </Pressable>
  );
}

const LOGO_TONES = [
  { bg: colors.deep, fg: colors.goldSoft },
  { bg: colors.mint, fg: colors.green },
  { bg: colors.goldSoft, fg: colors.goldInk },
];

export function monogram(company: string) {
  const w = company.trim().split(/\s+/);
  return (w.length > 1 ? w[0]![0]! + w[1]![0]! : company.slice(0, 2)).toUpperCase();
}

export function CompanyMark({ company, size = 48 }: { company: string; size?: number }) {
  const hash = [...company].reduce((h, c) => h + c.charCodeAt(0), 0);
  const tone = LOGO_TONES[hash % LOGO_TONES.length]!;
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.33, backgroundColor: tone.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: tone.fg, fontWeight: '800', fontSize: size * 0.34 }}>{monogram(company)}</Text>
    </View>
  );
}

export function JobCard({ job }: { job: Job }) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push(`/job/${job.id}`)} style={({ pressed }) => [cardStyles.job, pressed && { opacity: 0.85 }]}>
      <View style={cardStyles.jobTop}>
        <CompanyMark company={job.company} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[type.small, { fontWeight: '600' }]}>{job.company}</Text>
          <Text style={cardStyles.jobTitle} numberOfLines={1}>
            {job.title}
          </Text>
        </View>
        {job.isNew ? <Pill label="YANGI" tone="gold" strong /> : null}
      </View>
      <View style={cardStyles.jobBottom}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Pill label={job.place} />
          <Pill label={job.mode} />
        </View>
        <Text style={[cardStyles.jobSalary, type.num]}>{job.salary}</Text>
      </View>
    </Pressable>
  );
}

const cardStyles = StyleSheet.create({
  save: { alignItems: 'center', justifyContent: 'center' },
  saveGlass: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  saveDot: { position: 'absolute', bottom: 7, width: 4, height: 4, borderRadius: 2 },

  featured: { height: 372, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.photo },
  featuredBadges: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', gap: 6 },
  featuredSave: { position: 'absolute', top: 10, right: 10 },
  featuredBody: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 18, gap: 4 },
  featuredPrice: { color: colors.white, fontSize: 28, fontWeight: '800', letterSpacing: -0.9 },
  featuredUnit: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  featuredTitle: { color: colors.white, fontSize: 16, fontWeight: '600' },
  factRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  fact: {
    height: 26, paddingHorizontal: 10, borderRadius: radius.pill, justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  factText: { color: colors.white, fontSize: 12, fontWeight: '600' },

  row: { flexDirection: 'row', gap: 14, padding: 10, borderRadius: 22, backgroundColor: colors.surface },
  rowImg: { width: 96, height: 96, borderRadius: 16, backgroundColor: colors.field },
  rowBody: { flex: 1, minWidth: 0, justifyContent: 'center', gap: 2 },
  rowKicker: { fontSize: 12, fontWeight: '700', color: colors.green, letterSpacing: 0.3 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: colors.ink },
  rowPrice: { fontSize: 17, fontWeight: '800', letterSpacing: -0.4, color: colors.ink, marginTop: 2 },
  rowUnit: { fontSize: 12, fontWeight: '500', color: colors.muted },
  rowSave: { justifyContent: 'flex-start' },

  tile: { borderRadius: 26, backgroundColor: colors.surface, overflow: 'hidden' },
  tilePhoto: { height: 210, backgroundColor: colors.photo },
  tileBody: { padding: 16, gap: 3 },
  tilePrice: { fontSize: 22, fontWeight: '800', letterSpacing: -0.6, color: colors.ink },

  gig: { width: 214, padding: 16, borderRadius: 26, gap: 10 },
  gigTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gigTime: { height: 28, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center' },
  gigTimeText: { fontSize: 12, fontWeight: '800', color: colors.ink },
  gigDist: { fontSize: 12, fontWeight: '700', color: colors.ink },
  gigTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.4, color: colors.ink, lineHeight: 21 },
  gigPlace: { fontSize: 13, color: colors.inkSoft, opacity: 0.85 },
  gigPay: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4, color: colors.ink },

  job: { padding: 16, borderRadius: radius.lg, backgroundColor: colors.surface, gap: 12 },
  jobTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  jobTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  jobBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobSalary: { fontWeight: '800', color: colors.green, fontSize: 15 },
});
