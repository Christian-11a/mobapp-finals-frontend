import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { verifyPassword, checkEmailExists, updateStoredUser } from '../../services/authService';
import { validateFirstName, validateLastName, validateEmail, validatePhone } from '../../utils/validation';
import { VALIDATION } from '../../constants';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import { styles } from './EditProfileStyle';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'EditProfile'> };

export default function EditProfileScreen({ navigation }: Props) {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phoneNumber ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeField, setActiveField] = useState<string | null>(null);

  const setErr = (k: string, v?: string) =>
    setErrors(prev => ({ ...prev, [k]: v ?? '' }));

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

  const handleSave = () => {
    if (!validate()) {
      showToast('Please check the highlighted fields to continue.', 'info');
      return;
    }
    if (!verifyPassword(user!.id, currentPassword)) {
      setErrors(prev => ({ ...prev, currentPassword: VALIDATION.WRONG_CURRENT_PASSWORD }));
      showToast(VALIDATION.WRONG_CURRENT_PASSWORD, 'error');
      return;
    }
    if (email.toLowerCase() !== user!.email.toLowerCase() && checkEmailExists(email, user!.id)) {
      setErrors(prev => ({ ...prev, email: VALIDATION.DUPLICATE_EMAIL }));
      showToast(VALIDATION.DUPLICATE_EMAIL, 'error');
      return;
    }

    const updatedData = { 
      firstName: firstName.trim(), 
      lastName: lastName.trim(), 
      email: email.trim(),
      phoneNumber: phone.trim()
    };

    updateStoredUser(user!.id, updatedData);
    updateUser(updatedData);
    showToast(VALIDATION.PROFILE_UPDATED, 'success');
    navigation.goBack();
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
    showToggle: boolean = false
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputContainer, 
        errors[errorKey] ? styles.inputError : null,
        activeField === errorKey ? styles.inputActive : null
      ]}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={errors[errorKey] ? COLORS.red : (activeField === errorKey ? COLORS.gold : COLORS.gray400)} 
          style={styles.icon} 
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={t => { onChange(t); setErr(errorKey); }}
          onFocus={() => setActiveField(errorKey)}
          onBlur={() => setActiveField(null)}
          placeholder={placeholder}
          placeholderTextColor="rgba(10, 30, 61, 0.3)"
          keyboardType={keyboardType}
          secureTextEntry={secure}
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
            <Text style={styles.headerTitle}>Personal Info</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.card}>
            {renderInput('First Name', firstName, setFirstName, 'person-outline', 'firstName', 'Enter your first name')}
            {renderInput('Last Name', lastName, setLastName, 'person-outline', 'lastName', 'Enter your last name')}
            {renderInput('Email Address', email, setEmail, 'mail-outline', 'email', 'your@email.com', 'email-address')}
            {renderInput('Phone Number', phone, setPhone, 'call-outline', 'phone', '09123456789', 'phone-pad')}
          </View>

          <Text style={styles.sectionTitle}>Security Verification</Text>
          <View style={styles.card}>
            <View style={styles.noteContainer}>
              <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.gold} />
              <Text style={styles.noteText}>To protect your account, please enter your current password to confirm these changes.</Text>
            </View>
            {renderInput('Current Password', currentPassword, setCurrentPassword, 'lock-closed-outline', 'currentPassword', '••••••••', 'default', !showPass, true)}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>Save All Changes</Text>
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
