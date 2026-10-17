import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeTile, JobCard } from '@/components/cards';
import { Chip, EmptyState, Icon, Segmented } from '@/components/ui';
import { useHomes, useJobs, type Deal } from '@/lib/data';
import { colors, radius, shadow, TAB_BAR_SPACE, type } from '@/lib/theme';

const DEALS: { id: Deal | 'all'; label: string }[] = [
  { id: 'all', label: 'Hammasi' },
  { id: 'sotuv', label: 'Sotuv' },
  { id: 'ijara', label: 'Ijara' },
  { id: 'kunlik', label: 'Kunlik' },
];

const SUGGESTIONS = ['Yunusobod', 'Chilonzor', 'Hovli', 'Studiya', 'Villa', 'Mirzo Ulugʻbek'];

export default function Search() {
  const [section, setSection] = useState<'uyjoy' | 'ish'>('uyjoy');
  const [q, setQ] = useState('');
  const [deal, setDeal] = useState<Deal | 'all'>('all');
  const homes = useHomes({ q, deal });
  const jobs = useJobs(q);
  const isJobs = section === 'ish';
  const loading = isJobs ? jobs.isLoading : homes.isLoading;
  const count = isJobs ? (jobs.data?.length ?? 0) : (homes.data?.length ?? 0);

  const header = (
    <View style={styles.header}>
      <Text style={type.display}>Qidiruv</Text>
      <Segmented
        options={[
          { value: 'uyjoy', label: 'Uy-joy' },
          { value: 'ish', label: 'Ish' },
        ]}
        value={section}
        onChange={setSection}
      />
      <View style={[styles.field, shadow.soft]}>
        <Icon name="search" size={20} color={colors.muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={isJobs ? 'Kasb yoki kompaniya' : 'Tuman, koʻcha yoki mulk turi'}
          placeholderTextColor={colors.dim}
          style={styles.input}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Qidiruv"
        />
        {q ? (
          <Pressable onPress={() => setQ('')} hitSlop={10} accessibilityLabel="Tozalash">
            <Icon name="x-circle" size={20} color={colors.dim} />
          </Pressable>
        ) : null}
      </View>
      {!isJobs ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ marginHorizontal: -20 }}>
          <View style={{ width: 12 }} />
          {DEALS.map((d) => (
            <Chip key={d.id} label={d.label} selected={deal === d.id} onPress={() => setDeal(d.id)} />
          ))}
          <View style={{ width: 12 }} />
        </ScrollView>
      ) : null}
      {!q ? (
        <View style={styles.suggest}>
          {SUGGESTIONS.map((s) => (
            <Pressable key={s} onPress={() => setQ(s)} style={styles.suggestItem}>
              <Icon name="clock" size={14} color={colors.muted} />
              <Text style={styles.suggestText}>{s}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {!loading ? (
        <Text style={[type.label, { marginTop: 4 }]}>
          {count} TA NATIJA{q ? ` · «${q.toUpperCase()}»` : ''}
        </Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {isJobs ? (
        <FlatList
          data={jobs.data ?? []}
          keyExtractor={(j) => j.id}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => <JobCard job={item} />}
          ListEmptyComponent={loading ? <ActivityIndicator color={colors.green} /> : <EmptyState icon="briefcase" title="Hech narsa topilmadi" text="Boshqa soʻz bilan qidirib koʻring." />}
        />
      ) : (
        <FlatList
          data={homes.data ?? []}
          keyExtractor={(h) => h.id}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => <HomeTile home={item} />}
          ListEmptyComponent={loading ? <ActivityIndicator color={colors.green} /> : <EmptyState icon="home" title="Hech narsa topilmadi" text="Filtrlarni oʻzgartirib koʻring." />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  header: { gap: 14, paddingTop: 16, paddingBottom: 16 },
  list: { paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE },
  field: {
    height: 58, borderRadius: radius.pill, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20,
  },
  input: { flex: 1, fontSize: 16, color: colors.ink },
  suggest: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.field,
  },
  suggestText: { fontSize: 13, fontWeight: '600', color: colors.inkSoft },
});
