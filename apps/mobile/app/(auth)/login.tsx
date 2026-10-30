import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Icon, RoundButton } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { colors, radius, shadow, type } from '@/lib/theme';

function formatNational(digits: string) {
  const d = digits.slice(0, 9);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');
}

export default function Login() {
  const router = useRouter();
  const { otpSend, otpVerify } = useAuth();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [digits, setDigits] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const phone = `+998${digits}`;

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendCode = async () => {
    if (digits.length !== 9) {
      Alert.alert('Raqam toʻliq emas', 'Telefon raqamingizni 9 ta raqam bilan kiriting.');
      return;
    }
    setBusy(true);
    try {
      const res = await otpSend(phone);
      setCode('');
      setStep('code');
      setResendIn(60);
      if (res.devCode) {
        setCode(res.devCode);
        setTimeout(() => verify(res.devCode!), 300);
      }
    } catch (err) {
      Alert.alert('Kod yuborilmadi', (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (value: string) => {
    setBusy(true);
    try {
      await otpVerify(phone, value);
    } catch (err) {
      setCode('');
      Alert.alert('Kod notoʻgʻri', (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const press = (k: string) => {
    if (busy) return;
    if (k === 'del') return setCode((c) => c.slice(0, -1));
    if (code.length >= 6) return;
    const next = code + k;
    setCode(next);
    if (next.length === 6) void verify(next);
  };

  if (step === 'code') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.inner}>
          <RoundButton icon="chevron-left" label="Orqaga" onPress={() => setStep('phone')} />
          <View style={styles.head}>
            <Text style={styles.title}>Kodni kiriting</Text>
            <Text style={styles.sub}>
              <Text style={[styles.subStrong, type.num]}>+998 {formatNational(digits)}</Text> raqamiga yuborildi
            </Text>
          </View>

          <View style={styles.boxes} accessibilityLabel={`Tasdiqlash kodi, ${code.length} ta raqam kiritildi`}>
            {Array.from({ length: 6 }, (_, i) => {
              const ch = code[i] ?? '';
              const active = i === code.length;
              return (
                <View key={i} style={[styles.box, active ? styles.boxActive : ch ? styles.boxFilled : null]}>
                  <Text style={[styles.boxText, type.num]}>{ch}</Text>
                </View>
              );
            })}
          </View>

          {resendIn > 0 ? (
            <Text style={styles.resend}>
              Kod kelmadimi? <Text style={[styles.subStrong, type.num]}>0:{String(resendIn).padStart(2, '0')}</Text> dan keyin qayta yuborish
            </Text>
          ) : (
            <Pressable onPress={sendCode} hitSlop={8}>
              <Text style={[styles.resend, { color: colors.green, fontWeight: '700' }]}>Kodni qayta yuborish</Text>
            </Pressable>
          )}

          {code.length === 6 ? (
            <Button label="Tasdiqlash" tone="green" loading={busy} onPress={() => verify(code)} style={{ marginTop: 18 }} />
          ) : null}

          <View style={styles.keypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((k, i) =>
              k === '' ? (
                <View key={i} style={styles.key} />
              ) : (
                <Pressable
                  key={i}
                  accessibilityLabel={k === 'del' ? 'Oʻchirish' : k}
                  onPress={() => press(k)}
                  style={({ pressed }) => [styles.key, k !== 'del' && styles.keyFace, pressed && { backgroundColor: colors.field }]}
                >
                  {k === 'del' ? <Icon name="delete" size={24} /> : <Text style={styles.keyText}>{k}</Text>}
                </Pressable>
              ),
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <RoundButton icon="chevron-left" label="Orqaga" onPress={() => router.canGoBack() && router.back()} />
        <View style={[styles.head, { marginTop: 36 }]}>
          <Text style={styles.title}>Telefon raqamingiz</Text>
          <Text style={styles.sub}>Parol kerak emas — SMS orqali 6 xonali kod yuboramiz.</Text>
        </View>

        <Text style={[type.label, { marginTop: 30, marginBottom: 8 }]}>RAQAM</Text>
        <View style={styles.phoneField}>
          <View style={styles.prefix}>
            <View style={styles.flag}>
              <View style={{ flex: 1, backgroundColor: '#1EB5E5' }} />
              <View style={{ flex: 1, backgroundColor: colors.white }} />
              <View style={{ flex: 1, backgroundColor: '#1EB53A' }} />
            </View>
            <Text style={styles.prefixText}>+998</Text>
          </View>
          <TextInput
            value={formatNational(digits)}
            onChangeText={(t) => setDigits(t.replace(/\D/g, '').slice(0, 9))}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            placeholder="90 123 45 67"
            placeholderTextColor={colors.dim}
            style={[styles.phoneInput, type.num]}
            autoFocus
            accessibilityLabel="Telefon raqami"
          />
        </View>

        <View style={styles.bottom}>
          <Button label="Kod olish" onPress={sendCode} loading={busy} disabled={digits.length !== 9} />
          <Text style={styles.terms}>
            Davom etib, <Text style={styles.link}>Foydalanish shartlari</Text> va <Text style={styles.link}>Maxfiylik siyosati</Text>ga rozilik
            bildirasiz.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  inner: { flex: 1, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 16 },
  head: { marginTop: 28, gap: 10 },
  title: { fontSize: 36, lineHeight: 38, letterSpacing: -1.6, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 16, color: colors.muted, lineHeight: 22 },
  subStrong: { fontWeight: '700', color: colors.ink },
  phoneField: {
    flexDirection: 'row', alignItems: 'center', height: 68, borderRadius: 22, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.green, overflow: 'hidden', ...shadow.soft,
  },
  prefix: {
    height: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16,
    borderRightWidth: 1, borderRightColor: '#ECECE6',
  },
  flag: { width: 22, height: 16, borderRadius: 3, overflow: 'hidden' },
  prefixText: { fontWeight: '700', fontSize: 16, color: colors.ink },
  phoneInput: { flex: 1, height: '100%', paddingHorizontal: 16, fontSize: 22, fontWeight: '700', letterSpacing: 0.8, color: colors.ink },
  bottom: { marginTop: 'auto', gap: 12 },
  terms: { fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 17 },
  link: { color: colors.ink, textDecorationLine: 'underline' },
  boxes: { marginTop: 28, flexDirection: 'row', gap: 8 },
  box: {
    flex: 1, height: 64, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  boxActive: { borderWidth: 2, borderColor: colors.ink },
  boxFilled: { borderWidth: 1.5, borderColor: colors.green },
  boxText: { fontSize: 28, fontWeight: '800', color: colors.ink },
  resend: { marginTop: 16, fontSize: 14, color: colors.muted },
  keypad: { marginTop: 'auto', flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, justifyContent: 'space-between' },
  key: { width: '32%', height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  keyFace: { backgroundColor: colors.surface },
  keyText: { fontSize: 24, fontWeight: '600', color: colors.ink },
});
