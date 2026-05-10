import { Tabs, useRouter } from 'expo-router';
import { BookOpen, Map, Radar, User } from 'lucide-react-native';
import { TabBar, type TabBarItem } from '@/components/TabBar';

const ITEMS: ReadonlyArray<TabBarItem> = [
  { name: 'index', label: 'Map', Icon: Map },
  { name: 'logbook', label: 'Logbook', Icon: BookOpen },
  { name: 'radar', label: 'Radar', Icon: Radar },
  { name: 'profile', label: 'Profile', Icon: User },
];

export default function TabsLayout() {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <TabBar
          {...props}
          items={ITEMS}
          onFabPress={() => router.push('/add-spot')}
        />
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="logbook" />
      <Tabs.Screen name="radar" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
