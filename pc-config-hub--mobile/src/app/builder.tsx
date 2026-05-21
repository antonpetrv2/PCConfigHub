import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/components/AppShell';
import { ProtectedScreen } from '@/components/ProtectedScreen';
import { categoryLabels, categoryOrder } from '@/constants/catalog';
import { colors } from '@/constants/theme';

export default function BuilderScreen() {
  return (
    <ProtectedScreen>
      <AppShell title="Builder" showBack>
        <Text style={styles.subtitle}>
          Select parts from the same categories used by the web builder and catalog.
        </Text>

        <View style={styles.grid}>
          {categoryOrder.map((category) => (
            <View key={category} style={styles.categoryCard}>
              <Text style={styles.categoryName}>{categoryLabels[category]}</Text>
              <Text style={styles.categoryStatus}>Not selected</Text>
            </View>
          ))}
        </View>

        <Link href="/configurations" style={styles.link}>
          View configurations
        </Link>
      </AppShell>
    </ProtectedScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 18,
  },
  grid: {
    gap: 12,
    marginBottom: 22,
  },
  categoryCard: {
    backgroundColor: 'rgba(18, 17, 38, 0.94)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  categoryName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  categoryStatus: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  link: {
    alignSelf: 'flex-start',
    borderColor: 'rgba(255, 91, 241, 0.6)',
    borderRadius: 999,
    borderWidth: 1,
    color: colors.accentTwo,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 11,
    textTransform: 'uppercase',
  },
});
