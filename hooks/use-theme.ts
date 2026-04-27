import { useColorScheme } from './use-color-scheme';
import { Colors, type ThemeMode, type ThemeTokens } from '@/constants/theme';

export function useTheme(): { mode: ThemeMode; c: ThemeTokens } {
  const scheme = useColorScheme();
  const mode: ThemeMode = scheme === 'dark' ? 'dark' : 'light';
  return { mode, c: Colors[mode] };
}
