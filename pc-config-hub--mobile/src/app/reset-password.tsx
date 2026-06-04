import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppShell } from '@/components/AppShell';
import { colors } from '@/constants/theme';
import { ApiClientError, resetPasswordRequest } from '@/services/api';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(params.token ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!token.trim() || !password || !confirmPassword) {
      setError('Complete all fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await resetPasswordRequest(token.trim(), password);
      router.replace('/login');
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : 'Unable to reset password. Try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell title="Reset password" showBack>
      <View style={styles.card}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
          onChangeText={setToken}
          placeholder="Reset token"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={token}
        />
        <TextInput
          editable={!isSubmitting}
          onChangeText={setPassword}
          placeholder="New password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          style={styles.input}
          value={password}
        />
        <TextInput
          editable={!isSubmitting}
          onChangeText={setConfirmPassword}
          placeholder="Confirm password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          disabled={isSubmitting}
          onPress={handleSubmit}
          style={[styles.primaryButton, isSubmitting && styles.disabledButton]}>
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? 'Saving...' : 'Save password'}
          </Text>
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
    gap: 14,
    padding: 18,
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
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 999,
    marginTop: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
});
