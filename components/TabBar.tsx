import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { type LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FAB } from './FAB';
import { GlassPanel } from './GlassPanel';
import { useTheme } from '@/theme/useTheme';

const TAB_BAR_HEIGHT = 64;
const HORIZONTAL_INSET = 12;
const BOTTOM_OFFSET = 24;

export type TabBarItem = {
  /** Route name as registered in Expo Router (matches `name` in <Tabs.Screen />) */
  name: string;
  label: string;
  Icon: LucideIcon;
};

export type TabBarProps = BottomTabBarProps & {
  items: ReadonlyArray<TabBarItem>;
  onFabPress?: () => void;
};

export function TabBar({ state, navigation, items, onFabPress }: TabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name;
  const half = Math.ceil(items.length / 2);
  const left = items.slice(0, half);
  const right = items.slice(half);

  const handlePress = (name: string) => {
    const event = navigation.emit({ type: 'tabPress', target: name, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(name);
  };

  const renderTab = (item: TabBarItem) => {
    const isActive = item.name === activeRoute;
    const color = isActive ? t.palette.accent : t.palette.ink2;
    return (
      <Pressable
        key={item.name}
        onPress={() => handlePress(item.name)}
        accessibilityRole="tab"
        accessibilityLabel={item.label}
        accessibilityState={{ selected: isActive }}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}
      >
        <item.Icon size={22} color={color} strokeWidth={isActive ? 2.5 : 2} />
        <Text
          style={{
            fontFamily: 'Poppins_600SemiBold',
            fontWeight: '600',
            fontSize: 11,
            color,
          }}
        >
          {item.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: HORIZONTAL_INSET,
        right: HORIZONTAL_INSET,
        bottom: Math.max(insets.bottom, BOTTOM_OFFSET),
      }}
    >
      <GlassPanel
        variant="tabBar"
        style={{
          height: TAB_BAR_HEIGHT,
          borderRadius: t.radius.tabBar,
          flexDirection: 'row',
          alignItems: 'center',
          ...t.shadows.tabBar,
        }}
      >
        {left.map(renderTab)}
        {/* Center spacer for the FAB */}
        <View style={{ width: 64 }} />
        {right.map(renderTab)}
      </GlassPanel>
      {onFabPress ? (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: -22,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
        >
          <FAB onPress={onFabPress} accessibilityLabel="Add spot" />
        </View>
      ) : null}
    </View>
  );
}
