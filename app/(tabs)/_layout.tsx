import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { useTheme } from '@/hooks/use-theme';

type TabIconProps = { color: string; focused: boolean };

function makeIcon(name: keyof typeof Ionicons.glyphMap, focusName: keyof typeof Ionicons.glyphMap) {
  const TabIcon = ({ color, focused }: TabIconProps) => (
    <Ionicons name={focused ? focusName : name} size={focused ? 24 : 22} color={color} />
  );
  TabIcon.displayName = `TabIcon(${String(name)})`;
  return TabIcon;
}

export default function TabLayout() {
  const { c, mode } = useTheme();
  const insets = useSafeAreaInsets();

  // Bottom inset compensates for the system gesture bar / nav buttons.
  // We add 6px breathing room so labels never sit flush against the gesture pill.
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 8);
  const tabHeight = 56 + bottomPad;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.tabIconDefault,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: c.backgroundElevated,
            borderTopColor: c.border,
            borderTopWidth: StyleSheet.hairlineWidth,
            height: tabHeight,
            paddingTop: 6,
            paddingBottom: bottomPad,
            // Soft elevation to separate from content
            shadowColor: mode === 'dark' ? '#000' : c.shadow,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: mode === 'dark' ? 0.4 : 1,
            shadowRadius: 12,
            elevation: 8,
          },
        ],
        tabBarItemStyle: { paddingVertical: 2 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: makeIcon('home-outline', 'home') }}
      />
      <Tabs.Screen
        name="categories"
        options={{ title: 'Browse', tabBarIcon: makeIcon('apps-outline', 'apps') }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.searchPill,
                {
                  backgroundColor: focused ? c.primary : 'transparent',
                  borderColor: focused ? c.primary : c.border,
                },
              ]}
            >
              <Ionicons name="search" size={focused ? 18 : 18} color={focused ? '#fff' : color} />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: makeIcon('settings-outline', 'settings') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    // Avoid the floating-card look — keep it solidly anchored to the bottom
    // so it never visually mixes with the system nav strip.
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  searchPill: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: -10,   // raises the pill slightly above the row for emphasis
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});
