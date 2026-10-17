import Feather from '@expo/vector-icons/Feather';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadow, type } from '@/lib/theme';

export type IconName = ComponentProps<typeof Feather>['name'];

export function Icon({ name, size = 22, color = colors.ink }: { name: IconName; size?: number; color?: string }) {
  return <Feather name={name} size={size} color={color} />;
}

/** 46pt white circle used for header actions. */
export function RoundButton({
  icon,
  onPress,
  label,
  dot,
  tone = 'light',
  style,
}: {
  icon: IconName;
  onPress?: () => void;
  label: string;
  dot?: boolean;
  tone?: 'light' | 'glass' | 'dark';
  style?: StyleProp<ViewStyle>;
}) {
  const t = roundTones[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.round, t.box, tone === 'light' && shadow.soft, pressed && styles.pressed, style]}
    >
      <Icon name={icon} size={20} color={t.fg} />
      {dot ? <View style={[styles.dot, { borderColor: tone === 'dark' ? colors.deep : colors.white }]} /> : null}
    </Pressable>
  );
}

const roundTones = {
  light: { box: { backgroundColor: colors.surface }, fg: colors.ink },
  glass: { box: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder }, fg: colors.white },
  dark: { box: { backgroundColor: 'rgba(255,255,255,0.1)' }, fg: colors.white },
};

export function BackButton({ tone = 'light' }: { tone?: 'light' | 'glass' }) {
  const router = useRouter();
  return (
    <RoundButton
      icon="chevron-left"
      label="Orqaga"
      tone={tone}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
    />
  );
}

/** Title row for pushed screens: back button, big title, optional trailing action. */
export function ScreenHeader({ title, right, subtitle }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.headerRow}>
        <BackButton />
        <View style={{ flex: 1 }} />
        {right}
      </View>
      <Text style={type.display}>{title}</Text>
      {subtitle ? <Text style={[type.body, { color: colors.muted }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  tone = 'light',
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';
  return (
    <View style={[styles.segment, { backgroundColor: dark ? 'rgba(255,255,255,0.1)' : colors.field }]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.segmentItem, on && { backgroundColor: dark ? colors.white : colors.ink }]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: on ? (dark ? colors.deep : colors.white) : dark ? 'rgba(255,255,255,0.8)' : '#3B4239' },
                on && { fontWeight: '700' },
              ]}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected ? styles.chipOn : styles.chipOff]}
    >
      <Text style={[styles.chipText, { color: selected ? colors.white : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

const pillTones = {
  green: { bg: colors.green, fg: colors.white },
  gold: { bg: colors.goldSoft, fg: colors.goldInk },
  mint: { bg: colors.mint, fg: colors.green },
  glass: { bg: colors.glass, fg: colors.white },
  soft: { bg: colors.ground, fg: colors.ink },
  dark: { bg: 'rgba(14,20,17,0.55)', fg: colors.white },
};

export function Pill({ label, tone = 'soft', strong }: { label: string; tone?: keyof typeof pillTones; strong?: boolean }) {
  const t = pillTones[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }, tone === 'glass' && styles.pillGlass]}>
      <Text style={[styles.pillText, { color: t.fg }, strong && { fontWeight: '800', letterSpacing: 0.6 }]}>{label}</Text>
    </View>
  );
}

const buttonTones = {
  ink: { bg: colors.ink, fg: colors.white, border: colors.ink },
  green: { bg: colors.green, fg: colors.white, border: colors.green },
  gold: { bg: colors.goldSoft, fg: colors.goldInk, border: colors.goldSoft },
  outline: { bg: colors.surface, fg: colors.ink, border: colors.border },
  mint: { bg: colors.mint, fg: colors.green, border: colors.mint },
};

export function Button({
  label,
  onPress,
  tone = 'ink',
  icon,
  loading,
  disabled,
  size = 'lg',
  style,
}: {
  label: string;
  onPress?: () => void;
  tone?: keyof typeof buttonTones;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}) {
  const t = buttonTones[tone];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { height: size === 'lg' ? 58 : 46, backgroundColor: t.bg, borderColor: t.border },
        (pressed || disabled) && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={t.fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={18} color={t.fg} /> : null}
          <Text style={[styles.buttonText, { color: t.fg, fontSize: size === 'lg' ? 16 : 14 }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={type.h2}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({ icon, title, text, children }: { icon: IconName; title: string; text?: string; children?: ReactNode }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={26} color={colors.green} />
      </View>
      <Text style={[type.h3, { textAlign: 'center' }]}>{title}</Text>
      {text ? <Text style={[type.small, { textAlign: 'center', fontSize: 14 }]}>{text}</Text> : null}
      {children}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Avatar({ name, size = 52, tone = 'deep' }: { name: string; size?: number; tone?: 'deep' | 'gold' | 'mint' }) {
  const t = {
    deep: { bg: colors.deep, fg: colors.goldSoft },
    gold: { bg: colors.goldSoft, fg: colors.deep },
    mint: { bg: colors.mint, fg: colors.green },
  }[tone];
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: t.fg, fontWeight: '800', fontSize: size * 0.4 }}>{(name.trim()[0] ?? 'H').toUpperCase()}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  pressed: { opacity: 0.75 },
  round: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  dot: {
    position: 'absolute', top: 10, right: 11, width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.gold, borderWidth: 2,
  },
  screenHeader: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, gap: 6 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  segment: { flexDirection: 'row', padding: 4, borderRadius: radius.pill },
  segmentItem: { flex: 1, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontSize: 14, fontWeight: '600' },
  chip: { height: 42, paddingHorizontal: 16, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  chipOn: { backgroundColor: colors.green },
  chipOff: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipText: { fontSize: 14, fontWeight: '600' },
  pill: { height: 28, paddingHorizontal: 11, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  pillGlass: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  pillText: { fontSize: 12, fontWeight: '700' },
  button: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 22, borderRadius: radius.pill, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  buttonText: { fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  sectionAction: { fontSize: 14, fontWeight: '600', color: colors.green },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 48, paddingHorizontal: 32 },
  emptyIcon: { width: 64, height: 64, borderRadius: 22, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16 },
});

/** Status bar style that only applies while its screen is focused (tabs/stack screens stay mounted). */
export function FocusStatusBar({ style }: { style: 'light' | 'dark' }) {
  const focused = useIsFocused();
  return focused ? <StatusBar style={style} /> : null;
}
