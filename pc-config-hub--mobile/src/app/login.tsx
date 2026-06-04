import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { AppShell } from '@/components/AppShell';
import { colors } from '@/constants/theme';
import { ApiClientError } from '@/services/api';

export default function LoginScreen() {
  const { isAuthenticated, login, logout, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError('Enter email and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(trimmedEmail, password);
    } catch (loginError) {
      const message =
        loginError instanceof ApiClientError && loginError.status === 401
          ? 'Invalid email or password. Create an account in the web app first if you do not have one.'
          : loginError instanceof ApiClientError
            ? loginError.message
            : 'Unable to login. Check the API server and try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell title="Login" showBack>
      <View style={styles.card}>
        {isAuthenticated ? (
          <>
            <Text style={styles.successText}>Signed in as {user?.name ?? user?.email}.</Text>
            <Link href="/builder" style={styles.secondaryLink}>
              Continue to builder
            </Link>
            <Pressable onPress={() => void logout()} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>Sign in to manage your saved PC configurations.</Text>

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
            <View style={styles.passwordField}>
              <TextInput
                editable={!isSubmitting}
                onChangeText={setPassword}
                onSubmitEditing={handleSubmit}
                placeholder="Password"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                value={password}
              />
              <Pressable
                onPress={() => setShowPassword((value) => !value)}
                style={styles.passwordToggle}>
                <Text style={styles.passwordToggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={[styles.primaryButton, isSubmitting && styles.disabledButton]}>
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Signing in...' : 'Login'}
              </Text>
            </Pressable>

            <Link href="/forgot-password" style={styles.secondaryLink}>
              Forgot password?
            </Link>

            <Text style={styles.helperText}>
              New users can register in the web app at http://localhost:3000/register.
            </Text>
          </>
        )}
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
    marginBottom: 8,
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
  logoutButton: {
    alignSelf: 'flex-start',
    borderColor: 'rgba(255, 91, 241, 0.6)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  logoutButtonText: {
    color: colors.accentTwo,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  helperText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
});
