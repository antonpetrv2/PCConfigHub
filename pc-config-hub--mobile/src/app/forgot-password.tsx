import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppShell } from '@/components/AppShell';
import { colors } from '@/constants/theme';
import { ApiClientError, forgotPasswordRequest } from '@/services/api';

const getResetToken = (resetUrl: string) => {
  try {
    return new URL(resetUrl).searchParams.get('token') ?? '';
  } catch {
    return '';
  }
};

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resetToken = resetUrl ? getResetToken(resetUrl) : '';

  const handleSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Enter your email.');
      return;
    }

    setError(null);
    setMessage(null);
    setResetUrl(null);
    setIsSubmitting(true);

    try {
      const result = await forgotPasswordRequest(trimmedEmail);
      setMessage('If the account exists, a reset link has been created.');
      setResetUrl(result.resetUrl);
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : 'Unable to create reset link. Try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell title="Forgot password" showBack>
      <View style={styles.card}>
        <Text style={styles.subtitle}>Create a password reset link for your account.</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={email}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {message ? <Text style={styles.successText}>{message}</Text> : null}
        {resetUrl ? (
          <>
            <Text style={styles.resetUrl}>{resetUrl}</Text>
            <Link
              href={{
                pathname: '/reset-password',
                params: { token: resetToken },
              }}
              style={styles.secondaryLink}>
              Use reset link
            </Link>
          </>
        ) : null}

        <Pressable
          disabled={isSubmitting}
          onPress={handleSubmit}
          style={[styles.primaryButton, isSubmitting && styles.disabledButton]}>
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? 'Creating...' : 'Create reset link'}
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
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
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
  resetUrl: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
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
  secondaryLink: {
    alignSelf: 'flex-start',
    color: colors.accentTwo,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 4,
    textTransform: 'uppercase',
  },
});
