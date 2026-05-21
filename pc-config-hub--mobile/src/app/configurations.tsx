import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/components/AppShell';
import { colors } from '@/constants/theme';

const configurations = [
  {
    id: 'starter',
    name: 'Starter Configuration',
    description: 'Private draft ready for part selection.',
    status: 'Private',
  },
  {
    id: 'public-review',
    name: 'Public Review Configuration',
    description: 'Waiting for moderation before publishing.',
    status: 'Pending',
  },
];

export default function ConfigurationsScreen() {
  return (
    <AppShell title="Configurations" showBack>
      <View style={styles.toolbar}>
        <Text style={styles.caption}>Saved builds from the PCConfigHub workflow.</Text>
        <Link href="/builder" style={styles.actionLink}>
          New build
        </Link>
      </View>

      <View style={styles.list}>
        {configurations.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{item.name}</Text>
              <Text style={styles.rowMeta}>{item.description}</Text>
            </View>
            <View style={styles.rowActions}>
              <Text style={styles.status}>{item.status}</Text>
              <Link href="/builder" style={styles.rowLink}>
                Open
              </Link>
            </View>
          </View>
        ))}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 18,
  },
  caption: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  actionLink: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    color: colors.background,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 11,
    textTransform: 'uppercase',
  },
  list: {
    gap: 12,
  },
  row: {
    backgroundColor: 'rgba(18, 17, 38, 0.94)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    padding: 16,
  },
  rowText: {
    gap: 6,
  },
  rowTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  rowMeta: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  rowActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  status: {
    color: colors.accentThree,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  rowLink: {
    color: colors.accentTwo,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
