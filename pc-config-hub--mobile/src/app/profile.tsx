import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { AppShell } from '@/components/AppShell';
import { ProtectedScreen } from '@/components/ProtectedScreen';
import { API_URL } from '@/services/api';
import { colors } from '@/constants/theme';

export default function ProfileScreen() {
  return (
    <ProtectedScreen>
      <ProfileContent />
    </ProtectedScreen>
  );
}

function ProfileContent() {
  const { logout, user } = useAuth();

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
