import { Platform } from 'react-native';

const tintColorLight = '#4F46E5';   // indigo-600
const tintColorDark  = '#A5B4FC';   // indigo-300

export const Colors = {
  light: {
    text: '#0F172A',          // slate-900
    textMuted: '#64748B',     // slate-500
    textSubtle: '#94A3B8',    // slate-400
    background: '#FAFAFB',    // very subtle off-white
    backgroundElevated: '#FFFFFF',
    card: '#FFFFFF',
    cardSubtle: '#F4F4F7',    // slightly cooler than the bg
    border: '#E5E7EB',        // gray-200
    borderStrong: '#D1D5DB',  // gray-300
    tint: tintColorLight,
    primary: tintColorLight,
    primarySoft: '#EEF2FF',   // indigo-50
    accent: '#EC4899',        // pink-500 — vivid pop
    accentSoft: '#FCE7F3',
    success: '#059669',       // emerald-600
    warning: '#D97706',       // amber-600
    danger: '#DC2626',        // red-600
    icon: '#475569',          // slate-600
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    overlay: 'rgba(15, 23, 42, 0.55)',
    shadow: 'rgba(15, 23, 42, 0.06)',
  },
  dark: {
    text: '#F8FAFC',          // slate-50
    textMuted: '#94A3B8',     // slate-400
    textSubtle: '#64748B',    // slate-500
    background: '#0A0A12',    // near-black with cool tint
    backgroundElevated: '#141420',
    card: '#16161F',
    cardSubtle: '#1E1E2A',
    border: '#27273A',
    borderStrong: '#34344A',
    tint: tintColorDark,
    primary: tintColorDark,
    primarySoft: '#1E1B4B',   // indigo-950
    accent: '#F472B6',        // pink-400
    accentSoft: '#3F1936',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
    overlay: 'rgba(0, 0, 0, 0.65)',
    shadow: 'rgba(0, 0, 0, 0.4)',
  },
};

export type ThemeMode = keyof typeof Colors;
export type ThemeTokens = typeof Colors.light;

export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 36 };
export const Radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

export const Typography = {
  display:    { fontSize: 30, lineHeight: 36, fontWeight: '800' as const, letterSpacing: -0.6 },
  h1:         { fontSize: 24, lineHeight: 30, fontWeight: '800' as const, letterSpacing: -0.4 },
  h2:         { fontSize: 20, lineHeight: 26, fontWeight: '700' as const, letterSpacing: -0.2 },
  h3:         { fontSize: 17, lineHeight: 22, fontWeight: '700' as const },
  body:       { fontSize: 15, lineHeight: 22, fontWeight: '500' as const },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '700' as const },
  small:      { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  caption:    { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.2 },
  mono:       { fontSize: 15, lineHeight: 20, fontWeight: '600' as const },
};

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
