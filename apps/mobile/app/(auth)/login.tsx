import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { colors, radius, spacing } from '@/lib/theme';

export default function Login() {
  const { otpSend, otpVerify } = useAuth();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('+998');
  const [code, setCode] = useState('');
  const [expiresInSec, setExpiresInSec] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    if (phone.replace(/\D/g, '').length < 9) {
      Alert.alert('Xatolik', "Telefon raqamingizni to'liq kiriting");
      return;
    }
    setBusy(true);
    try {
      const { expiresInSec } = await otpSend(phone);
      setExpiresInSec(expiresInSec);
      setStep('code');
    } catch (err) {
      Alert.alert('Kod yuborilmadi', (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(code)) {
      Alert.alert('Xatolik', '6 raqamli kodni kiriting');
      return;
    }
    setBusy(true);
    try {
      await otpVerify(phone, code);
    } catch (err) {
      Alert.alert('Kirish amalga oshmadi', (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <View style={styles.brand}>
          <Text style={styles.brandDot}>●</Text>
          <Text style={styles.brandText}>Joymee</Text>
        </View>

        <Text style={styles.title}>
          {step === 'phone' ? 'Xush kelibsiz' : 'SMS kodingizni kiriting'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'phone'
            ? 'Telefon raqamingizga SMS kod yuboramiz'
            : expiresInSec
              ? `Kod ${Math.floor(expiresInSec / 60)} daqiqa amal qiladi`
              : 'Kod yuborildi'}
        </Text>

        {step === 'phone' ? (
          <>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholder="+998 90 123 45 67"
              placeholderTextColor={colors.dim}
              style={styles.input}
            />
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              onPress={sendCode}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <Text style={styles.buttonText}>Kod yuborish</Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <TextInput
              value={code}
              onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              autoComplete="sms-otp"
              placeholder="123456"
              placeholderTextColor={colors.dim}
              style={[styles.input, styles.codeInput]}
              autoFocus
            />
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              onPress={verify}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <Text style={styles.buttonText}>Tasdiqlash</Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setStep('phone');
                setCode('');
              }}
            >
              <Text style={styles.secondaryLink}>← Telefon raqamni o'zgartirish</Text>
            </Pressable>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.xxl },
  brandDot: { color: colors.accent, fontSize: 24 },
  brandText: { color: colors.fg, fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  title: { color: colors.fg, fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { color: colors.muted, fontSize: 15, marginBottom: spacing.xl },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    color: colors.fg,
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  codeInput: { fontSize: 24, letterSpacing: 8, textAlign: 'center' },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pressed: { opacity: 0.8 },
  buttonText: { color: colors.bg, fontSize: 16, fontWeight: '600' },
  secondaryLink: { color: colors.muted, textAlign: 'center', fontSize: 14, paddingVertical: spacing.sm },
});
