import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/components/AppShell';
import { colors } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <AppShell>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Retro-futurist hardware lab</Text>
        <Text style={styles.title}>Prototype your next build in a neon-lit command bay.</Text>
        <Text style={styles.subtitle}>
          Scan parts, validate compatibility, and publish configurations once your rig is
          lab-certified.
        </Text>

        <View style={styles.actions}>
          <Link href="/login" style={styles.primaryLink}>
            Login
          </Link>
          <Link href="/configurations" style={styles.secondaryLink}>
            Configurations
          </Link>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Active build</Text>
          <Text style={styles.badge}>Certified</Text>
        </View>
        {['Motherboard', 'CPU', 'GPU'].map((item) => (
          <View key={item} style={styles.partRow}>
            <Text style={styles.partName}>{item}</Text>
            <Text style={styles.partStatus}>Ready</Text>
          </View>
        ))}
        <Text style={styles.powerDraw}>Compatibility status: ready for validation</Text>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 18,
    justifyContent: 'center',
    minHeight: 360,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 44,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 17,
    lineHeight: 25,
    maxWidth: 620,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  primaryLink: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    color: colors.background,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingVertical: 14,
    textTransform: 'uppercase',
  },
  secondaryLink: {
    borderColor: 'rgba(255, 91, 241, 0.6)',
    borderRadius: 999,
    borderWidth: 1,
    color: colors.accentTwo,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingVertical: 14,
    textTransform: 'uppercase',
  },
  panel: {
    backgroundColor: 'rgba(18, 17, 38, 0.94)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  panelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  panelTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  badge: {
    backgroundColor: 'rgba(48, 242, 255, 0.16)',
    borderRadius: 999,
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  partRow: {
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  partName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  partStatus: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  powerDraw: {
    backgroundColor: 'rgba(255, 209, 102, 0.1)',
    borderColor: 'rgba(255, 209, 102, 0.4)',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.accentThree,
    fontSize: 14,
    lineHeight: 20,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
