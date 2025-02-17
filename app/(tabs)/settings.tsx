import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function Settings() {
  const { signOut } = useAuth();

  const settingsOptions = [
    {
      title: 'Account',
      icon: 'person-outline',
      onPress: () => console.log('Account pressed')
    },
    {
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => console.log('Notifications pressed')
    },
    {
      title: 'Privacy',
      icon: 'lock-closed-outline',
      onPress: () => console.log('Privacy pressed')
    },
    {
      title: 'Help',
      icon: 'help-circle-outline',
      onPress: () => console.log('Help pressed')
    },
    {
      title: 'About',
      icon: 'information-circle-outline',
      onPress: () => console.log('About pressed')
    },
    {
      title: 'Sign Out',
      icon: 'log-out-outline',
      onPress: signOut
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView>
        {settingsOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionItem}
            onPress={option.onPress}
          >
            <View style={styles.optionContent}>
              <Ionicons name={option.icon as keyof typeof Ionicons.glyphMap} size={24} color="#666" />
              <Text style={styles.optionText}>{option.title}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={24} color="#666" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf8',
    padding: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  optionText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#333'
  }
});
