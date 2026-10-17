import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanyMark } from '@/components/cards';
import { BackButton, Button, EmptyState, Icon, Pill, FocusStatusBar } from '@/components/ui';
import { getApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { timeAgo, useJob } from '@/lib/data';
import { colors, radius, type } from '@/lib/theme';

export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { me } = useAuth();
  const { data: job, isLoading } = useJob(id);
  const [applied, setApplied] = useState(false);

  const chat = useMutation({
    mutationFn: async () => await getApi().chats.start(id),
    onSuccess: (c) => router.push(`/chat/${c.id}`),
    onError: (err) => Alert.alert('Chat ochilmadi', (err as Error).message),
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.green} />
      </View>
    );
  }
  if (!job) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 12, paddingHorizontal: 20 }]}>
        <BackButton />
        <EmptyState icon="alert-circle" title="Vakansiya topilmadi" />
      </View>
    );
  }

  const isOwn = Boolean(me && job.userId === me.user.id);
  const apply = () => {
    if (job.isDemo) {
      setApplied(true);
      return;
    }
    chat.mutate();
  };

  return (
    <View style={styles.container}>
      <FocusStatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
          <View style={styles.ring1} />
          <View style={styles.ring2} />
          <BackButton tone="glass" />
          <View style={styles.heroBody}>
            <CompanyMark company={job.company} size={64} />
            <Text style={styles.company}>{job.company}</Text>
            <Text style={styles.title}>{job.title}</Text>
            <Text style={[styles.salary, type.num]}>{job.salary}</Text>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              <Pill label={job.place} tone="glass" />
              <Pill label={job.mode} tone="glass" />
              {job.time ? <Pill label={job.time} tone="gold" /> : null}
              {job.isNew ? <Pill label="YANGI" tone="gold" strong /> : null}
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.stats}>
            <Stat icon="clock" label="Joylandi" value={timeAgo(job.postedAt)} />
            <Stat icon="briefcase" label="Turi" value={job.kind === 'kunlik' ? 'Kunlik' : 'Doimiy'} />
            <Stat icon="map-pin" label="Masofa" value={job.distance ?? job.place} />
          </View>

          {job.description ? (
            <View style={styles.card}>
              <Text style={type.h3}>Ish haqida</Text>
              <Text style={styles.desc}>{job.description}</Text>
            </View>
          ) : null}

          {job.requirements.length > 0 ? (
            <View style={styles.card}>
              <Text style={type.h3}>Talablar</Text>
              {job.requirements.map((r) => (
                <View key={r} style={styles.req}>
                  <View style={styles.check}>
                    <Icon name="check" size={13} color={colors.green} />
                  </View>
                  <Text style={styles.reqText}>{r}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {applied ? (
            <View style={styles.applied}>
              <Icon name="check-circle" size={20} color={colors.green} />
              <Text style={styles.appliedText}>Ariza yuborildi. Ish beruvchi javob berganda xabar olasiz.</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {!isOwn ? (
        <View style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}>
          <Button
            label="Yozish"
            tone="outline"
            size="md"
            style={{ height: 56 }}
            onPress={() => (job.isDemo ? Alert.alert('Namuna', 'Bu namuna vakansiya — chat ochilmaydi.') : chat.mutate())}
          />
          <Button
            label={applied ? 'Ariza yuborildi' : 'Ariza yuborish'}
            icon={applied ? 'check' : 'send'}
            tone="green"
            size="md"
            style={{ flex: 1, height: 56 }}
            disabled={applied}
            loading={chat.isPending}
            onPress={apply}
          />
        </View>
      ) : null}
    </View>
  );
}

function Stat({ icon, label, value }: { icon: 'clock' | 'briefcase' | 'map-pin'; label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Icon name={icon} size={18} color={colors.green} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  hero: { backgroundColor: colors.deep, paddingHorizontal: 20, paddingBottom: 26, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  ring1: { position: 'absolute', right: -70, top: -40, width: 240, height: 240, borderRadius: 120, borderWidth: 1, borderColor: 'rgba(242,227,179,0.16)' },
  ring2: { position: 'absolute', right: -30, top: 0, width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: 'rgba(242,227,179,0.22)' },
  heroBody: { marginTop: 22, gap: 8 },
  company: { color: 'rgba(255,255,255,0.72)', fontSize: 14, fontWeight: '600', marginTop: 6 },
  title: { color: colors.white, fontSize: 26, lineHeight: 29, fontWeight: '800', letterSpacing: -0.9 },
  salary: { color: colors.goldSoft, fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
  body: { padding: 20, gap: 14 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, padding: 12, borderRadius: 18, backgroundColor: colors.surface, gap: 4 },
  statLabel: { fontSize: 11, color: colors.muted, fontWeight: '600', marginTop: 2 },
  statValue: { fontSize: 14, fontWeight: '800', color: colors.ink },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, gap: 10 },
  desc: { fontSize: 15, lineHeight: 23, color: colors.inkSoft },
  req: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  check: { width: 24, height: 24, borderRadius: 8, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  reqText: { flex: 1, fontSize: 15, color: colors.ink },
  applied: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 18, backgroundColor: colors.mint, alignItems: 'center' },
  appliedText: { flex: 1, color: colors.green, fontWeight: '600', fontSize: 14 },
  bar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.96)', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(14,20,17,0.12)',
  },
});
