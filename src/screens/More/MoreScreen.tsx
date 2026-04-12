import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import styles from './styles';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  icon: IoniconsName;
  iconBg: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

interface MenuGroup {
  groupLabel: string;
  items: MenuItem[];
}

export default function MoreScreen() {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  const handleLogout = () => {
    logout();
    showToast('You have been logged out.', 'info');
  };

  const menuGroups: MenuGroup[] = [
    {
      groupLabel: 'EXPLORE',
      items: [
        { icon: 'information-circle-outline', iconBg: '#fce8d5', label: 'About Us', onPress: () => navigation.navigate('AboutUs') },
      ],
    },
    {
      groupLabel: 'SUPPORT',
      items: [
        { icon: 'help-circle-outline', iconBg: '#e8f5e9', label: 'FAQs', onPress: () => navigation.navigate('FAQ') },
        { icon: 'document-text-outline', iconBg: '#f3e8ff', label: 'Terms & Policies', onPress: () => navigation.navigate('Policies') },
      ],
    },
    {
      groupLabel: 'ACCOUNT',
      items: [
        { icon: 'person-outline', iconBg: '#e0f2fe', label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile') },
        { icon: 'log-out-outline', iconBg: '#fce8e8', label: 'Log Out', onPress: handleLogout, danger: true },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>
        <View style={styles.memberBadge}>
          <Text style={styles.memberBadgeText}>Member</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {menuGroups.map(group => (
          <View key={group.groupLabel}>
            <Text style={styles.groupLabel}>{group.groupLabel}</Text>
            <View style={styles.menuCard}>
              {group.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuItem, idx < group.items.length - 1 && styles.menuItemBorder]}
                  onPress={item.onPress}
                  activeOpacity={0.75}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: item.iconBg }]}>
                    <Ionicons name={item.icon} size={20} color={item.danger ? COLORS.red : COLORS.navy} />
                  </View>
                  <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                    {item.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.gray300} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerLogo}>✦ LUXESTAY</Text>
          <Text style={styles.footerText}>© {new Date().getFullYear()} LuxeStay, Inc.</Text>
          <Text style={styles.footerText}>All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}