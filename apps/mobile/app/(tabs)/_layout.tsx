import { Tabs } from 'expo-router';
import { TabBar } from '@/components/TabBar';
import { colors } from '@/lib/theme';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.ground } }}
    >
      <Tabs.Screen name="index" options={{ title: 'Asosiy' }} />
      <Tabs.Screen name="search" options={{ title: 'Qidiruv' }} />
      <Tabs.Screen name="chat" options={{ title: 'Xabarlar' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
