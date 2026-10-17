import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/** HamJoy premium mobile palette — warm ground, deep green, soft gold. */
export const colors = {
  ground: '#F4F4F0',
  surface: '#FFFFFF',
  field: '#E8E8E2',
  hairline: '#F0F0EA',
  border: '#DCDCD5',
  ink: '#0E1411',
  inkSoft: '#2A302B',
  muted: '#5B6159',
  dim: '#8E948C',
  green: '#1F6B3F',
  greenBright: '#3FA36B',
  deep: '#0F2A1C',
  mint: '#E7F1EA',
  gold: '#C9A24E',
  goldSoft: '#F2E3B3',
  goldInk: '#3B2C05',
  goldWash: '#FBF4DE',
  danger: '#B42318',
  white: '#FFFFFF',
  photo: '#1B2A21',
  tabBar: '#121915',
  glass: 'rgba(255,255,255,0.22)',
  glassBorder: 'rgba(255,255,255,0.3)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

export const radius = { sm: 12, md: 18, lg: 24, xl: 30, pill: 999 };

/** Space the floating tab bar takes over scroll content. */
export const TAB_BAR_SPACE = 120;

export const shadow = {
  soft: Platform.select<ViewStyle>({
    ios: { shadowColor: colors.ink, shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
    default: { elevation: 2 },
  }),
  lift: Platform.select<ViewStyle>({
    ios: { shadowColor: colors.ink, shadowOpacity: 0.22, shadowRadius: 22, shadowOffset: { width: 0, height: 14 } },
    default: { elevation: 8 },
  }),
};

export const type = {
  display: { fontSize: 34, fontWeight: '800', letterSpacing: -1.4, color: colors.ink } as TextStyle,
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -1, color: colors.ink } as TextStyle,
  h2: { fontSize: 22, fontWeight: '800', letterSpacing: -0.6, color: colors.ink } as TextStyle,
  h3: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3, color: colors.ink } as TextStyle,
  body: { fontSize: 15, color: colors.ink } as TextStyle,
  small: { fontSize: 13, color: colors.muted } as TextStyle,
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, color: colors.muted } as TextStyle,
  num: { fontVariant: ['tabular-nums'] } as TextStyle,
};
