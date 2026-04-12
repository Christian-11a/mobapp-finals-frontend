import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { verifyPassword, checkEmailExists, updateStoredUser } from '../../services/authService';
import { validateFirstName, validateLastName, validateEmail } from '../../utils/validation';
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
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!currentPassword) errs.currentPassword = VALIDATION.PASSWORD_REQUIRED;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      showToast('Please fix the errors before saving.', 'error');
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
    updateStoredUser(user!.id, { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
    updateUser({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
    showToast(VALIDATION.PROFILE_UPDATED, 'success');
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={[styles.input, errors.firstName && styles.inputError]}
          value={firstName}
          onChangeText={v => { setFirstName(v); setErr('firstName'); }}
          placeholder="First name"
          placeholderTextColor={COLORS.gray400}
        />
        {!!errors.firstName && <Text style={styles.error}>{errors.firstName}</Text>}

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={[styles.input, errors.lastName && styles.inputError]}
          value={lastName}
          onChangeText={v => { setLastName(v); setErr('lastName'); }}
          placeholder="Last name"
          placeholderTextColor={COLORS.gray400}
        />
        {!!errors.lastName && <Text style={styles.error}>{errors.lastName}</Text>}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={email}
          onChangeText={v => { setEmail(v); setErr('email'); }}
          placeholder="Email address"
          placeholderTextColor={COLORS.gray400}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {!!errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <View style={styles.divider} />
        <Text style={styles.noteText}>Enter your current password to save changes.</Text>

        <Text style={styles.label}>Current Password</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            style={[styles.input, errors.currentPassword && styles.inputError, { paddingRight: 44 }]}
            value={currentPassword}
            onChangeText={v => { setCurrentPassword(v); setErr('currentPassword'); }}
            placeholder="Current password"
            placeholderTextColor={COLORS.gray400}
            secureTextEntry={!showPass}
          />
          <TouchableOpacity
            style={{ position: 'absolute', right: 14, top: 13 }}
            onPress={() => setShowPass(p => !p)}
          >
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        </View>
        {!!errors.currentPassword && <Text style={styles.error}>{errors.currentPassword}</Text>}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
