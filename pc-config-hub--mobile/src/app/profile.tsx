import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { AppShell } from '@/components/AppShell';
import { ProtectedScreen } from '@/components/ProtectedScreen';
import { API_URL, ApiClientError, changePasswordRequest } from '@/services/api';
import { colors } from '@/constants/theme';

export default function ProfileScreen() {
  return (
    <ProtectedScreen>
      <ProfileContent />
    </ProtectedScreen>
  );
}

function ProfileContent() {
  const { logout, token, user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!token) {
      setPasswordError('Login again before changing password.');
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Complete all password fields.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordError(null);
    setPasswordMessage(null);
    setIsChangingPassword(true);

    try {
      await changePasswordRequest(currentPassword, newPassword, token);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password changed.');
    } catch (requestError) {
      setPasswordError(
        requestError instanceof ApiClientError
          ? requestError.message
          : 'Unable to change password. Try again.'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <AppShell title="Profile" showBack>
      <View style={styles.card}>
        <Text style={styles.label}>Signed in account</Text>
        <Text style={styles.name}>{user?.name ?? 'PCConfigHub user'}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.roleRow}>
          <Text style={styles.roleLabel}>Role</Text>
          <Text style={styles.roleBadge}>{user?.role ?? 'user'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Mobile API</Text>
        <Text style={styles.metaText}>{API_URL}</Text>
        <Text style={styles.helperText}>
          The mobile app uses bearer tokens and talks to the deployed Next.js REST API.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Change password</Text>
        <View style={styles.passwordField}>
          <TextInput
            editable={!isChangingPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            placeholderTextColor={colors.muted}
            secureTextEntry={!showCurrentPassword}
            style={styles.passwordInput}
            value={currentPassword}
          />
          <Pressable
            onPress={() => setShowCurrentPassword((value) => !value)}
            style={styles.passwordToggle}>
            <Text style={styles.passwordToggleText}>
              {showCurrentPassword ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.passwordField}>
          <TextInput
            editable={!isChangingPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            placeholderTextColor={colors.muted}
            secureTextEntry={!showNewPassword}
            style={styles.passwordInput}
            value={newPassword}
          />
          <Pressable
            onPress={() => setShowNewPassword((value) => !value)}
            style={styles.passwordToggle}>
            <Text style={styles.passwordToggleText}>{showNewPassword ? 'Hide' : 'Show'}</Text>
          </Pressable>
        </View>
        <View style={styles.passwordField}>
          <TextInput
            editable={!isChangingPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            placeholderTextColor={colors.muted}
            secureTextEntry={!showConfirmPassword}
            style={styles.passwordInput}
            value={confirmPassword}
          />
          <Pressable
            onPress={() => setShowConfirmPassword((value) => !value)}
            style={styles.passwordToggle}>
            <Text style={styles.passwordToggleText}>
              {showConfirmPassword ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        {passwordMessage ? <Text style={styles.successText}>{passwordMessage}</Text> : null}
        <Pressable
          disabled={isChangingPassword}
          onPress={handleChangePassword}
          style={[styles.primaryButton, isChangingPassword && styles.disabledButton]}>
          <Text style={styles.primaryButtonText}>
            {isChangingPassword ? 'Saving...' : 'Change password'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Link href="/configurations" style={styles.primaryLink}>
          My configurations
        </Link>
        <Pressable onPress={() => void logout()} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(18, 17, 38, 0.94)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
    padding: 18,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  name: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  email: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700',
  },
  roleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  roleLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  roleBadge: {
    backgroundColor: 'rgba(48, 242, 255, 0.14)',
    borderColor: 'rgba(48, 242, 255, 0.5)',
    borderRadius: 999,
    borderWidth: 1,
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 7,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  metaText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  helperText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  input: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  passwordField: {
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  passwordInput: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  passwordToggle: {
    alignSelf: 'stretch',
    borderLeftColor: colors.border,
    borderLeftWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  passwordToggleText: {
    color: colors.accentTwo,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  errorText: {
    backgroundColor: 'rgba(255, 91, 241, 0.1)',
    borderColor: 'rgba(255, 91, 241, 0.45)',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.accentTwo,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  successText: {
    backgroundColor: 'rgba(48, 242, 255, 0.1)',
    borderColor: 'rgba(48, 242, 255, 0.45)',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actions: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  primaryLink: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    color: colors.background,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 13,
    textTransform: 'uppercase',
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 999,
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  logoutButton: {
    borderColor: 'rgba(255, 91, 241, 0.6)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  logoutText: {
    color: colors.accentTwo,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});
