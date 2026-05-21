import { Link } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppShell } from '@/components/AppShell';
import { colors } from '@/constants/theme';

export default function LoginScreen() {
  return (
    <AppShell title="Login" showBack>
      <View style={styles.card}>
        <Text style={styles.subtitle}>Sign in to manage your saved PC configurations.</Text>

        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          style={styles.input}
        />

        <Link href="/configurations" style={styles.primaryLink}>
          Continue
        </Link>
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
  primaryLink: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 999,
    color: colors.background,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginTop: 8,
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingVertical: 14,
    textTransform: 'uppercase',
  },
});
