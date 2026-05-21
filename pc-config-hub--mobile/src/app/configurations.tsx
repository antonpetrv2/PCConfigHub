import { Link } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { AppShell } from '@/components/AppShell';
import { colors } from '@/constants/theme';
import { ApiClientError, type ConfigSummary, listConfigsRequest } from '@/services/api';

export default function ConfigurationsScreen() {
  const { token, user } = useAuth();
  const [configs, setConfigs] = useState<ConfigSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadConfigs = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const data = await listConfigsRequest(token);
      setConfigs(data);
    } catch (loadError) {
      const message =
        loadError instanceof ApiClientError
          ? loadError.message
          : 'Unable to load configurations.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadConfigs();
  }, [loadConfigs]);

  const activeConfigs = useMemo(
    () =>
      configs.filter(
        (config) =>
          config.approvalStatus === 'approved' ||
          (user && config.ownerUserId === user.id && config.approvalStatus !== 'rejected')
      ),
    [configs, user]
  );

  return (
    <AppShell title="Configurations" showBack>
      <View style={styles.toolbar}>
        <Text style={styles.caption}>
          Active public builds plus your private configurations when you are signed in.
        </Text>
        <View style={styles.toolbarActions}>
          <Link href="/builder" style={styles.actionLink}>
            New build
          </Link>
          <Pressable onPress={() => void loadConfigs()} style={styles.refreshButton}>
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.stateText}>Loading configurations</Text>
        </View>
      ) : error ? (
        <View style={styles.stateBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : activeConfigs.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>No active configurations yet.</Text>
          <Link href="/builder" style={styles.emptyLink}>
            Start builder
          </Link>
        </View>
      ) : (
        <View style={styles.list}>
          {activeConfigs.map((config) => (
            <ConfigCard key={config.id} config={config} isOwner={user?.id === config.ownerUserId} />
          ))}
        </View>
      )}
    </AppShell>
  );
}

function ConfigCard({ config, isOwner }: { config: ConfigSummary; isOwner: boolean }) {
  return (
    <Link
      href={{ pathname: '/builder', params: { configId: String(config.id) } }}
      asChild>
      <Pressable style={styles.card}>
        <View style={styles.cover}>
          {config.coverImage ? (
            <Image
              source={{ uri: config.coverImage }}
              accessibilityLabel={config.coverImageAlt ?? config.name}
              resizeMode="contain"
              style={styles.coverImage}
            />
          ) : (
            <Text style={styles.coverPlaceholder}>No case image yet</Text>
          )}
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{config.name}</Text>
            <Text style={styles.badge}>{isOwner ? 'Mine' : config.visibility}</Text>
          </View>
          {config.description ? <Text style={styles.description}>{config.description}</Text> : null}
          <View style={styles.metrics}>
            <Text style={styles.metric}>{config.partsCount} parts</Text>
            <Text style={styles.metric}>{config.estimatedWattage}W est.</Text>
          </View>
          <Text style={styles.owner}>By {config.ownerName}</Text>
        </View>
      </Pressable>
    </Link>
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
  toolbarActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  refreshButton: {
    borderColor: 'rgba(255, 91, 241, 0.6)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  refreshText: {
    color: colors.accentTwo,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  list: {
    gap: 14,
  },
  card: {
    backgroundColor: 'rgba(18, 17, 38, 0.94)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cover: {
    alignItems: 'center',
    aspectRatio: 16 / 9,
    backgroundColor: colors.panelSoft,
    justifyContent: 'center',
    padding: 12,
  },
  coverImage: {
    height: '100%',
    width: '100%',
  },
  coverPlaceholder: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  cardBody: {
    gap: 10,
    padding: 16,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 24,
  },
  badge: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    textTransform: 'uppercase',
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metric: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  owner: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  stateBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 17, 38, 0.94)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  stateText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    color: colors.accentTwo,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyLink: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
});
