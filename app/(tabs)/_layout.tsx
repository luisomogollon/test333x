import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';
import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

const ACTIVE_TINT_COLOR = '#ddd';
const INACTIVE_TINT_COLOR = '#666';
const TAB_BAR_BACKGROUND_COLOR = '#292524';
const tabIconSize = Math.min(width * 0.08, 28);

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: TAB_BAR_BACKGROUND_COLOR,
    elevation: 5,
    height: 57, // increase height
    paddingTop: 10, // add top padding
  },
});

const tabs = [
{ name: 'index', title: 'Home', icon: 'home-outline' },
{ name: 'cart', title: 'Cart', icon: 'bag-outline' },
{ name: 'favorites', title: 'Favorites', icon: 'heart-outline' },
{ name: 'settings', title: 'Help Chat', icon: 'chatbubble-ellipses-outline' },
  { name: 'profile', title: 'Profile', icon: 'person-outline' },
];

export default function TabLayout() {
const { user, loading } = useAuth();

if (loading) return <LoadingScreen />;
if (!user) return <Redirect href="/auth/login" />;

const renderTabIcon = (icon: any, color: string) => (
<Ionicons name={icon} size={tabIconSize} color={color} />
  );

return (
<Tabs
screenOptions={{
headerShown: false,
tabBarActiveTintColor: ACTIVE_TINT_COLOR,
tabBarInactiveTintColor: INACTIVE_TINT_COLOR,
tabBarStyle: styles.tabBarStyle,
tabBarShowLabel: false,
   
      }}
    >
{tabs.map((tab) => (
<Tabs.Screen
key={tab.name}
name={tab.name}
options={{
title: tab.title,
tabBarIcon: ({ color }) => renderTabIcon(tab.icon, color),
          }}
        />
))}
</Tabs>
);
}
