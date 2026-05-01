import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, StatusBar, Platform, Image, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { validateFirstName, validateLastName, validateEmail, validatePhone } from '../../utils/validation';
import { VALIDATION } from '../../constants';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import { styles } from './EditProfileStyle';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'EditProfile'> };

export default function EditProfileScreen({ navigation }: Props) {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const isAdmin = user?.role === 'admin';

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phoneNumber ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeField, setActiveField] = useState<string | null>(null);

  const setErr = (k: string, v?: string) =>
    setErrors(prev => ({ ...prev, [k]: v ?? '' }));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    
    const fnErr = validateFirstName(firstName);
    if (fnErr) errs.firstName = fnErr;
    
    const lnErr = validateLastName(lastName);
    if (lnErr) errs.lastName = lnErr;
    
    const emErr = validateEmail(email);
    if (emErr) errs.email = emErr;

    const phErr = validatePhone(phone);
    if (phErr) errs.phone = phErr;
    
    if (!currentPassword) errs.currentPassword = VALIDATION.PASSWORD_REQUIRED;
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      showToast('Please check the highlighted fields to continue.', 'info');
      return;
    }

    setLoading(true);
    try {
      if (!user) return;
      
      await authService.reauthenticate(currentPassword);
      
      let finalAvatarUrl = user.avatarUrl;
      if (avatarUri) {
        finalAvatarUrl = await userService.uploadAvatar(user.id, avatarUri);
      }

      const updatedData: Partial<UserType> = { 
        firstName: firstName.trim(), 
        lastName: lastName.trim(), 
        email: email.trim(),
        phoneNumber: phone.trim()
      };

      if (finalAvatarUrl) {
        updatedData.avatarUrl = finalAvatarUrl;
      }

      await updateUser(updatedData);
      showToast(isAdmin ? 'Admin profile updated.' : VALIDATION.PROFILE_UPDATED, 'success');
      navigation.goBack();
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setErrors(prev => ({ ...prev, currentPassword: VALIDATION.WRONG_CURRENT_PASSWORD }));
      }
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string, 
    value: string, 
    onChange: (t: string) => void, 
    icon: any, 
    errorKey: string,
    placeholder: string,
    keyboardType: any = 'default',
    secure: boolean = false,
    showToggle: boolean = false,
    editable: boolean = true
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputContainer, 
        errors[errorKey] ? styles.inputError : null,
        activeField === errorKey ? styles.inputActive : null,
        !editable ? { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' } : null
      ]}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={errors[errorKey] ? COLORS.red : (activeField === errorKey ? COLORS.gold : COLORS.gray400)} 
          style={styles.icon} 
        />
        <TextInput
          style={[styles.input, !editable ? { color: COLORS.gray500 } : null]}
          value={value}
          onChangeText={t => { onChange(t); setErr(errorKey); }}
          onFocus={() => setActiveField(errorKey)}
          onBlur={() => setActiveField(null)}
          placeholder={placeholder}
          placeholderTextColor="rgba(10, 30, 61, 0.3)"
          keyboardType={keyboardType}
          secureTextEntry={secure}
          editable={editable}
          autoCapitalize={errorKey === 'email' ? 'none' : 'words'}
        />
        {showToggle && (
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        )}
      </View>
      {!!errors[errorKey] && <Text style={styles.errorText}>{errors[errorKey]}</Text>}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <KeyboardAwareScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false} 
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerCircle1} />
          <View style={styles.headerCircle2} />
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={headerStyles.headerTitle as any}>{isAdmin ? 'Admin Identity' : 'Personal Info'}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Avatar Section */}
          <View style={{ alignItems: 'center', marginTop: -60, marginBottom: 24 }}>
            <View style={{ 
              width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.white, 
              padding: 4, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2, shadowRadius: 8
            }}>
              <View style={{ flex: 1, borderRadius: 56, overflow: 'hidden', backgroundColor: COLORS.navy, justifyContent: 'center', alignItems: 'center' }}>
                {avatarUri || user?.avatarUrl ? (
                  <Image source={{ uri: avatarUri || user?.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Text style={{ fontSize: 40, fontWeight: 'bold', color: COLORS.white }}>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </Text>
                )}
              </View>
              <TouchableOpacity 
                style={{ 
                  position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, 
                  borderRadius: 18, backgroundColor: COLORS.gold, justifyContent: 'center', 
                  alignItems: 'center', borderWidth: 3, borderColor: COLORS.white 
                }}
                onPress={pickImage}
              >
                <Ionicons name="camera" size={18} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>{isAdmin ? 'Staff Assignment' : 'Basic Information'}</Text>
          <View style={styles.card}>
            {isAdmin && (
              <>
                {renderInput('Staff ID', user?.id.slice(0, 8).toUpperCase() || 'AD-001', () => {}, 'barcode-outline', 'staffId', '', 'default', false, false, false)}
                {renderInput('Role', 'System Supervisor', () => {}, 'briefcase-outline', 'jobTitle', '', 'default', false, false, false)}
              </>
            )}
            {renderInput('First Name', firstName, setFirstName, 'person-outline', 'firstName', 'Enter your first name')}
            {renderInput('Last Name', lastName, setLastName, 'person-outline', 'lastName', 'Enter your last name')}
            {renderInput('Email Address', email, setEmail, 'mail-outline', 'email', 'your@email.com', 'email-address')}
            {renderInput('Phone Number', phone, setPhone, 'call-outline', 'phone', '09123456789', 'phone-pad')}
          </View>

          <Text style={styles.sectionTitle}>Security Verification</Text>
          <View style={styles.card}>
            <View style={styles.noteContainer}>
              <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.gold} />
              <Text style={styles.noteText}>To protect {isAdmin ? 'system access' : 'your account'}, please enter your current password to confirm these changes.</Text>
            </View>
            {renderInput('Current Password', currentPassword, setCurrentPassword, 'lock-closed-outline', 'currentPassword', '••••••••', 'default', !showPass, true)}
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSave} 
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveBtnText}>Save All Changes</Text>
            )}
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const headerStyles = {
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
};
