import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chip, Icon, RoundButton, Segmented, type IconName } from '@/components/ui';
import { getApi } from '@/lib/api';
import { colors, radius, type } from '@/lib/theme';

type Kind = 'sotuv' | 'ijara' | 'kunlik' | 'ish';

const KINDS: { id: Kind; icon: IconName; title: string; sub: string }[] = [
  { id: 'sotuv', icon: 'tag', title: 'Sotaman', sub: 'Kvartira, hovli, yer' },
  { id: 'ijara', icon: 'key', title: 'Ijaraga beraman', sub: 'Oylik ijara' },
  { id: 'kunlik', icon: 'sun', title: 'Kunlik ijara', sub: 'Mehmonlar uchun' },
  { id: 'ish', icon: 'briefcase', title: 'Vakansiya', sub: 'Xodim qidiryapman' },
];

// Seeded ids from apps/api/src/db/seed.ts
const LOCATIONS = [
  { id: 11, name: 'Yunusobod' },
  { id: 12, name: 'Chilonzor' },
  { id: 13, name: 'Mirzo Ulugʻbek' },
  { id: 14, name: 'Shayxontohur' },
  { id: 15, name: 'Sergeli' },
  { id: 16, name: 'Yakkasaroy' },
  { id: 2, name: 'Samarqand' },
  { id: 3, name: 'Buxoro' },
];

const CATEGORY: Record<Kind, number> = { sotuv: 11, ijara: 10, kunlik: 10, ish: 20 };

export default function Post() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [kind, setKind] = useState<Kind>('sotuv');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'UZS'>('USD');
  const [rooms, setRooms] = useState('');
  const [area, setArea] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState(LOCATIONS[0]!);
  const [description, setDescription] = useState('');

  const isJob = kind === 'ish';
  const pickKind = (k: Kind) => {
    setKind(k);
    setCurrency(k === 'sotuv' ? 'USD' : 'UZS');
  };

  const submit = useMutation({
    mutationFn: async () => {
      const amount = Number(price.replace(/\D/g, ''));
      const attrs: Record<string, string | number | boolean> = { district: location.name };
      if (!isJob && rooms) attrs.rooms = Number(rooms);
      if (!isJob && area) attrs.area = Number(area);
      if (kind === 'kunlik') attrs.period = 'kun';
      if (isJob && company.trim()) attrs.company = company.trim();
      const api = getApi();
      const created = await api.listings.create({
        type: isJob ? 'job' : kind === 'sotuv' ? 'sale' : 'rent',
        categoryId: CATEGORY[kind],
        locationId: location.id,
        title: title.trim(),
        description: description.trim(),
        price: amount ? { amount, currency, negotiable: false } : null,
        attrs,
      } as never);
      try {
        await api.listings.publish(created.id);
      } catch {
        /* stays a draft until moderation */
      }
      return created;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [isJob ? 'jobs' : 'homes'] });
      Alert.alert('Eʼlon yuborildi', 'Moderatsiyadan soʻng hammaga koʻrinadi.', [{ text: 'Yaxshi', onPress: () => router.back() }]);
    },
    onError: (err) => Alert.alert('Eʼlon joylanmadi', (err as Error).message),
  });

  const valid = title.trim().length >= 3;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.top}>
        <RoundButton icon="x" label="Yopish" onPress={() => router.back()} />
        <Text style={styles.topTitle}>Yangi eʼlon</Text>
        <View style={{ width: 46 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={type.h1}>Nima joylaysiz?</Text>
          <View style={styles.kinds}>
            {KINDS.map((k) => {
              const on = k.id === kind;
              return (
                <Pressable
                  key={k.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  onPress={() => pickKind(k.id)}
                  style={[styles.kind, on && styles.kindOn]}
                >
                  <View style={[styles.kindIcon, on && { backgroundColor: colors.goldSoft }]}>
                    <Icon name={k.icon} size={20} color={on ? colors.goldInk : colors.green} />
                  </View>
                  <Text style={[styles.kindTitle, on && { color: colors.white }]}>{k.title}</Text>
                  <Text style={[styles.kindSub, on && { color: 'rgba(255,255,255,0.7)' }]}>{k.sub}</Text>
                </Pressable>
              );
            })}
          </View>

          <Field label="SARLAVHA">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={isJob ? 'Masalan: Sotuv menejeri' : 'Masalan: 3 xonali kvartira, Yunusobod'}
              placeholderTextColor={colors.dim}
              style={styles.input}
              maxLength={140}
            />
          </Field>

          {isJob ? (
            <Field label="KOMPANIYA">
              <TextInput value={company} onChangeText={setCompany} placeholder="Kompaniya nomi" placeholderTextColor={colors.dim} style={styles.input} />
            </Field>
          ) : (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Field label="XONALAR" style={{ flex: 1 }}>
                <TextInput value={rooms} onChangeText={(t) => setRooms(t.replace(/\D/g, '').slice(0, 2))} keyboardType="number-pad" placeholder="3" placeholderTextColor={colors.dim} style={styles.input} />
              </Field>
              <Field label="MAYDON, M²" style={{ flex: 1 }}>
                <TextInput value={area} onChangeText={(t) => setArea(t.replace(/\D/g, '').slice(0, 5))} keyboardType="number-pad" placeholder="78" placeholderTextColor={colors.dim} style={styles.input} />
              </Field>
            </View>
          )}

          <Field label={isJob ? 'MAOSH' : kind === 'sotuv' ? 'NARX' : kind === 'kunlik' ? 'KUNLIK NARX' : 'OYLIK NARX'}>
            <View style={styles.priceRow}>
              <TextInput
                value={price}
                onChangeText={(t) => setPrice(t.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' '))}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.dim}
                style={[styles.input, styles.priceInput, type.num]}
              />
              <View style={{ width: 120 }}>
                <Segmented
                  options={[
                    { value: 'USD', label: '$' },
                    { value: 'UZS', label: 'soʻm' },
                  ]}
                  value={currency}
                  onChange={setCurrency}
                />
              </View>
            </View>
          </Field>

          <Field label="HUDUD">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {LOCATIONS.map((l) => (
                <Chip key={l.id} label={l.name} selected={l.id === location.id} onPress={() => setLocation(l)} />
              ))}
            </ScrollView>
          </Field>

          <Field label="TAVSIF">
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={isJob ? 'Vazifalar, ish vaqti, sharoitlar…' : 'Taʼmir, mebel, hujjatlar, atrofdagi infratuzilma…'}
              placeholderTextColor={colors.dim}
              style={[styles.input, styles.textarea]}
              multiline
              maxLength={5000}
            />
          </Field>

          <View style={styles.tip}>
            <Icon name="camera" size={18} color={colors.green} />
            <Text style={styles.tipText}>Rasmlarni joylangandan soʻng veb-saytdagi kabinet orqali qoʻshishingiz mumkin.</Text>
          </View>
        </ScrollView>

        <View style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}>
          <Button label="Eʼlonni joylash" tone="green" onPress={() => submit.mutate()} loading={submit.isPending} disabled={!valid} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children, style }: { label: string; children: ReactNode; style?: object }) {
  return (
    <View style={[{ gap: 8 }, style]}>
      <Text style={type.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8 },
  topTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30, gap: 20 },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kind: { width: '48.4%', padding: 14, borderRadius: 22, backgroundColor: colors.surface, gap: 4 },
  kindOn: { backgroundColor: colors.deep },
  kindIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  kindTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  kindSub: { fontSize: 12, color: colors.muted },
  input: { minHeight: 56, borderRadius: 18, backgroundColor: colors.surface, paddingHorizontal: 16, fontSize: 16, color: colors.ink, borderWidth: 1, borderColor: colors.border },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  priceInput: { flex: 1, fontSize: 20, fontWeight: '800' },
  textarea: { minHeight: 120, paddingTop: 16, textAlignVertical: 'top' },
  tip: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 18, backgroundColor: colors.mint, alignItems: 'center' },
  tipText: { flex: 1, fontSize: 13, color: colors.green, lineHeight: 18 },
  bar: { paddingHorizontal: 20, paddingTop: 10, backgroundColor: colors.ground },
});
