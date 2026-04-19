import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Text, TextInput, TouchableOpacity, View,
  StatusBar
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { 
  validateFirstName, 
  validateLastName, 
  validateEmail, 
  validatePhone, 
  validateRegisterPassword, 
  validateConfirmPassword 
} from '../../utils/validation';
import { COLORS } from '../../constants/colors';
import styles from './styles';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  
  const { login } = useAuth();
  const { showToast } = useToast();

  const validate = () => {
    const e: Record<string, string> = {};
    
    const fnErr = validateFirstName(firstName);
    if (fnErr) e.firstName = fnErr;

    const lnErr = validateLastName(lastName);
    if (lnErr) e.lastName = lnErr;

    const emErr = validateEmail(email);
    if (emErr) e.email = emErr;

    if (phone.trim()) {
      const phErr = validatePhone(phone);
      if (phErr) e.phone = phErr;
    }

    const pwErr = validateRegisterPassword(password);
    if (pwErr) e.password = pwErr;

    const cpwErr = validateConfirmPassword(password, confirmPassword);
    if (cpwErr) e.confirmPassword = cpwErr;

    if (!agreeTerms) e.terms = 'Please agree to our terms';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) {
      showToast('Please check the highlighted fields to continue.', 'info');
      return;
    }
    setLoading(true);
    try {
      const user = await authService.register(
        firstName.trim(), 
        lastName.trim(), 
        email.trim(), 
        password,
        phone.trim() || undefined
      );
      login(user);
      showToast(`Welcome to LuxeStay, ${user.firstName}!`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topSection}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={18} color="rgba(255, 255, 255, 0.5)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerLogoRow}>
          <View style={styles.logoBox}>
            <Ionicons name="business" size={18} color={COLORS.white} />
          </View>
          <Text style={styles.logoText}>LuxeStay</Text>
        </View>

        <Text style={styles.welcomeTitle}>Create account</Text>
        <Text style={styles.welcomeSubtitle}>Join thousands of travelers enjoying premium stays</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.formSection}>
            <View style={styles.nameRow}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>First Name</Text>
                <View style={[styles.inputContainer, errors.firstName ? styles.inputError : null]}>
                  <Ionicons name="person-outline" size={18} color="rgba(10, 30, 61, 0.4)" />
                  <TextInput
                    style={styles.input}
                    placeholder="John"
                    placeholderTextColor="rgba(10, 30, 61, 0.3)"
                    value={firstName}
                    onChangeText={t => { setFirstName(t); setErrors(p => ({ ...p, firstName: undefined })); }}
                    autoCapitalize="words"
                  />
                </View>
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Last Name</Text>
                <View style={[styles.inputContainer, errors.lastName ? styles.inputError : null]}>
                  <Ionicons name="person-outline" size={18} color="rgba(10, 30, 61, 0.4)" />
                  <TextInput
                    style={styles.input}
                    placeholder="Doe"
                    placeholderTextColor="rgba(10, 30, 61, 0.3)"
                    value={lastName}
                    onChangeText={t => { setLastName(t); setErrors(p => ({ ...p, lastName: undefined })); }}
                    autoCapitalize="words"
                  />
                </View>
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
                <Ionicons name="mail-outline" size={18} color="rgba(10, 30, 61, 0.4)" />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(10, 30, 61, 0.3)"
                  value={email}
                  onChangeText={t => { setEmail(t); setErrors(p => ({ ...p, email: undefined })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Phone Number</Text>
                <Text style={styles.optionalText}>Optional (09XXXXXXXXX)</Text>
              </View>
              <View style={[styles.inputContainer, errors.phone ? styles.inputError : null]}>
                <Ionicons name="call-outline" size={18} color="rgba(10, 30, 61, 0.4)" />
                <TextInput
                  style={styles.input}
                  placeholder="09XXXXXXXXX"
                  placeholderTextColor="rgba(10, 30, 61, 0.3)"
                  value={phone}
                  onChangeText={t => { setPhone(t); setErrors(p => ({ ...p, phone: undefined })); }}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
                <Ionicons name="lock-closed-outline" size={18} color="rgba(10, 30, 61, 0.4)" />
                <TextInput
                  style={styles.input}
                  placeholder="At least 8 characters"
                  placeholderTextColor="rgba(10, 30, 61, 0.3)"
                  value={password}
                  onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: undefined })); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(10, 30, 61, 0.4)" />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputContainer, errors.confirmPassword ? styles.inputError : null]}>
                <Ionicons name="lock-closed-outline" size={18} color="rgba(10, 30, 61, 0.4)" />
                <TextInput
                  style={styles.input}
                  placeholder="Repeat your password"
                  placeholderTextColor="rgba(10, 30, 61, 0.3)"
                  value={confirmPassword}
                  onChangeText={t => { setConfirmPassword(t); setErrors(p => ({ ...p, confirmPassword: undefined })); }}
                  secureTextEntry={!showPassword}
                />
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <TouchableOpacity 
              style={styles.termsRow} 
              onPress={() => { setAgreeTerms(!agreeTerms); setErrors(p => ({ ...p, terms: undefined })); }}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                {agreeTerms && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
              </View>
              <Text style={styles.termsText}>
                I agree to LuxeStay's{' '}
                <Text style={styles.termsBold} onPress={() => navigation.navigate('Policies')}>
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text style={styles.termsBold} onPress={() => navigation.navigate('Policies')}>
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>
            {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

            <TouchableOpacity 
              style={[styles.createButton, loading && { opacity: 0.7 }]} 
              onPress={handleRegister} 
              disabled={loading}
            >
              {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.createButtonText}>Create Account</Text>}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.signInLinkContainer} 
              onPress={() => navigation.navigate('SignIn')}
            >
              <Text style={styles.alreadyAccountText}>Already have an account?</Text>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}