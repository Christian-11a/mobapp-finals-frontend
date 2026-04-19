import React, { useState } from 'react';
import { 
  ScrollView, Text, TextInput, TouchableOpacity, View, 
  StatusBar, KeyboardAvoidingView, Platform, Alert 
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { deleteStoredUser } from '../../services/authService';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import styles from './styles';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Security'> };

export default function SecurityScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPws, setShowPws] = useState(false);

  const handleUpdatePassword = () => {
    if (!currentPw || !newPw || !confirmPw) {
      showToast('Please fill in all password fields.', 'info');
      return;
    }
    if (newPw !== confirmPw) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (newPw.length < 8) {
      showToast('Password must be at least 8 characters.', 'info');
      return;
    }

    // Mock update
    showToast('Password updated successfully.', 'success');
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is permanent and all your data will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            if (user?.id) {
              deleteStoredUser(user.id);
              logout();
              showToast('Account deleted successfully.', 'info');
            }
          } 
        }
      ]
    );
  };

  const renderInput = (
    label: string, 
    value: string, 
    onChange: (t: string) => void, 
    placeholder: string
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray400} style={styles.icon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="rgba(10, 30, 61, 0.3)"
          secureTextEntry={!showPws}
        />
        <TouchableOpacity onPress={() => setShowPws(!showPws)}>
          <Ionicons name={showPws ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.gray400} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={false}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerCircle1} />
          <View style={styles.headerCircle2} />
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Security</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Change Password Section */}
          <Text style={styles.sectionTitle}>Change Password</Text>
          <View style={styles.card}>
            {renderInput('Current Password', currentPw, setCurrentPw, '••••••••')}
            {renderInput('New Password', newPw, setNewPw, 'Min. 8 characters')}
            {renderInput('Confirm New Password', confirmPw, setConfirmPw, 'Repeat new password')}
            
            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdatePassword} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>Update Password</Text>
            </TouchableOpacity>
          </View>

          {/* Login Activity */}
          <Text style={styles.sectionTitle}>Login Activity</Text>
          <View style={styles.card}>
            <View style={styles.activityRow}>
              <View style={styles.deviceIconBox}>
                <Ionicons name={Platform.OS === 'ios' ? 'phone-portrait-outline' : 'phone-portrait'} size={24} color={COLORS.gold} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.deviceName}>{Platform.OS === 'ios' ? 'iPhone 15 Pro' : 'Pixel 8 Pro'}</Text>
                <Text style={styles.deviceDetail}>Manila, Philippines · Active Now</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Current</Text>
              </View>
            </View>
          </View>

          {/* Account Deletion */}
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={[styles.card, { borderColor: '#fecaca' }]}>
            <Text style={styles.dangerText}>
              Deleting your account will remove all your data, bookings, and personal information from our system. This cannot be undone.
            </Text>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={20} color={COLORS.red} />
              <Text style={styles.deleteBtnText}>Delete Account</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
