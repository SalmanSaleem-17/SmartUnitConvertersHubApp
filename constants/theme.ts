import { Platform } from 'react-native';

const tintColorLight = '#0EA5A5';
const tintColorDark = '#22D3D3';

export const Colors = {
  light: {
    text: '#0B1220',
    textMuted: '#5B6478',
    textSubtle: '#8A92A6',
    background: '#F7F9FC',
    backgroundElevated: '#FFFFFF',
    card: '#FFFFFF',
    cardSubtle: '#F1F4F9',
    border: '#E4E8EF',
    borderStrong: '#D6DCE6',
    tint: tintColorLight,
    primary: tintColorLight,
    primarySoft: '#D9F4F4',
    accent: '#7C3AED',
    accentSoft: '#EDE3FF',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    icon: '#5B6478',
    tabIconDefault: '#8A92A6',
    tabIconSelected: tintColorLight,
    overlay: 'rgba(11, 18, 32, 0.45)',
    shadow: 'rgba(11, 18, 32, 0.08)',
  },
  dark: {
    text: '#F1F5F9',
    textMuted: '#A4ADC2',
    textSubtle: '#717892',
    background: '#0B1220',
    backgroundElevated: '#141C2E',
    card: '#141C2E',
    cardSubtle: '#1B2438',
    border: '#243049',
    borderStrong: '#2E3B57',
    tint: tintColorDark,
    primary: tintColorDark,
    primarySoft: '#103E40',
    accent: '#A78BFA',
    accentSoft: '#2D2350',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    icon: '#A4ADC2',
    tabIconDefault: '#717892',
    tabIconSelected: tintColorDark,
    overlay: 'rgba(0, 0, 0, 0.55)',
    shadow: 'rgba(0, 0, 0, 0.35)',
  },
};

export type ThemeMode = keyof typeof Colors;
export type ThemeTokens = typeof Colors.light;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
};

export const Typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '800' as const, letterSpacing: -0.6 },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: '800' as const, letterSpacing: -0.4 },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const, letterSpacing: -0.2 },
  h3: { fontSize: 17, lineHeight: 22, fontWeight: '700' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '500' as const },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '700' as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.2 },
  mono: { fontSize: 15, lineHeight: 20, fontWeight: '600' as const },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
