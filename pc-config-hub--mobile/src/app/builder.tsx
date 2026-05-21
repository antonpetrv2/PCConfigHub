import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { AppShell } from '@/components/AppShell';
import { ProtectedScreen } from '@/components/ProtectedScreen';
import { categoryLabels, categoryOrder, type ApiCategory } from '@/constants/catalog';
import { colors } from '@/constants/theme';
import {
  ApiClientError,
  createConfigRequest,
  getConfigRequest,
  listPartsRequest,
  type PartRecord,
  updateConfigRequest,
  type Visibility,
} from '@/services/api';

type SelectionState = Record<ApiCategory, PartRecord | null>;

const emptySelection = (): SelectionState => ({
  motherboard: null,
  cpu: null,
  gpu: null,
  ram: null,
  psu: null,
  case: null,
  storage: null,
  soundcard: null,
});

export default function BuilderScreen() {
  return (
    <ProtectedScreen>
      <BuilderContent />
    </ProtectedScreen>
  );
}

function BuilderContent() {
  const { token } = useAuth();
  const params = useLocalSearchParams<{ configId?: string }>();
  const configId = params.configId ? Number(params.configId) : null;
  const isEditing = Boolean(configId && Number.isFinite(configId));

  const [activeCategory, setActiveCategory] = useState<ApiCategory>('motherboard');
  const [availableParts, setAvailableParts] = useState<PartRecord[]>([]);
  const [selection, setSelection] = useState<SelectionState>(() => emptySelection());
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !isEditing || !configId) {
      return;
    }

    let isMounted = true;

    const loadConfig = async () => {
      setIsLoadingConfig(true);
      setError(null);

      try {
        const config = await getConfigRequest(configId, token);
        if (!isMounted) {
          return;
        }

        const nextSelection = emptySelection();
        for (const part of config.parts) {
          nextSelection[part.category] = part;
        }

        setName(config.name);
        setDescription(config.description ?? '');
        setVisibility(config.visibility);
        setSelection(nextSelection);
      } catch (loadError) {
        const message =
          loadError instanceof ApiClientError
            ? loadError.message
            : 'Unable to load configuration.';
        if (isMounted) {
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoadingConfig(false);
        }
      }
    };

    void loadConfig();

    return () => {
      isMounted = false;
    };
  }, [configId, isEditing, token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    const loadParts = async () => {
      setIsLoadingParts(true);

      try {
        const parts = await listPartsRequest(activeCategory, token);
        if (isMounted) {
          setAvailableParts(parts);
        }
      } catch (loadError) {
        const message =
          loadError instanceof ApiClientError ? loadError.message : 'Unable to load parts.';
        if (isMounted) {
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoadingParts(false);
        }
      }
    };

    void loadParts();

    return () => {
      isMounted = false;
    };
  }, [activeCategory, token]);

  const selectedParts = useMemo(
    () => categoryOrder.map((category) => selection[category]).filter(Boolean) as PartRecord[],
    [selection]
  );

  const handleSave = async () => {
    if (!token) {
      setError('Login is required.');
      return;
    }

    if (!name.trim()) {
      setError('Configuration name is required.');
      return;
    }

    if (selectedParts.length === 0) {
      setError('Select at least one part.');
      return;
    }

    setError(null);
    setStatus(null);
    setIsSaving(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
        parts: selectedParts.map((part) => part.id),
      };

      const result =
        isEditing && configId
          ? await updateConfigRequest(configId, payload, token)
          : await createConfigRequest(payload, token);

      setStatus(
        result.compatibility.warnings.length
          ? `Saved with warnings: ${result.compatibility.warnings.join(' ')}`
          : 'Configuration saved.'
      );
    } catch (saveError) {
      const message =
        saveError instanceof ApiClientError
          ? formatApiError(saveError)
          : 'Unable to save configuration.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedInCategory = selection[activeCategory];

  return (
    <AppShell title={isEditing ? 'Edit Builder' : 'Builder'} showBack>
      <Text style={styles.subtitle}>
        Choose parts by category. A case is required before the backend can save a compatible
        configuration.
      </Text>

      {isLoadingConfig ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.stateText}>Loading configuration</Text>
        </View>
      ) : null}

      <View style={styles.formCard}>
        <TextInput
          onChangeText={setName}
          placeholder="Configuration name"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={name}
        />
        <TextInput
          multiline
          onChangeText={setDescription}
          placeholder="Description"
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.textArea]}
          value={description}
        />
        <View style={styles.visibilityRow}>
          <Pressable
            onPress={() => setVisibility('private')}
            style={[styles.visibilityButton, visibility === 'private' && styles.visibilityActive]}>
            <Text
              style={[
                styles.visibilityText,
                visibility === 'private' && styles.visibilityActiveText,
              ]}>
              Private
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setVisibility('public')}
            style={[styles.visibilityButton, visibility === 'public' && styles.visibilityActive]}>
            <Text
              style={[
                styles.visibilityText,
                visibility === 'public' && styles.visibilityActiveText,
              ]}>
              Public
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.grid}>
        {categoryOrder.map((category) => {
          const selectedPart = selection[category];
          const isActive = activeCategory === category;

          return (
            <Pressable
              key={category}
              onPress={() => setActiveCategory(category)}
              style={[styles.categoryCard, isActive && styles.categoryCardActive]}>
              <View style={styles.categoryText}>
                <Text style={styles.categoryName}>{categoryLabels[category]}</Text>
                <Text style={styles.categoryStatus}>{selectedPart?.name ?? 'Not selected'}</Text>
              </View>
              {selectedPart ? (
                <Pressable
                  onPress={() =>
                    setSelection((current) => ({
                      ...current,
                      [category]: null,
                    }))
                  }
                  style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>Clear</Text>
                </Pressable>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.picker}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>Choose {categoryLabels[activeCategory]}</Text>
          <Text style={styles.pickerMeta}>
            {selectedInCategory ? `Selected: ${selectedInCategory.name}` : 'Not selected'}
          </Text>
        </View>

        {isLoadingParts ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.stateText}>Loading parts</Text>
          </View>
        ) : availableParts.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>No accessible parts in this category.</Text>
          </View>
        ) : (
          <View style={styles.partList}>
            {availableParts.map((part) => (
              <Pressable
                key={part.id}
                onPress={() =>
                  setSelection((current) => ({
                    ...current,
                    [activeCategory]: part,
                  }))
                }
                style={[
                  styles.partCard,
                  selectedInCategory?.id === part.id && styles.partCardActive,
                ]}>
                <Text style={styles.partName}>{part.name}</Text>
                <Text style={styles.partMeta}>
                  {[part.manufacturer, part.model].filter(Boolean).join(' / ') || part.visibility}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {status ? <Text style={styles.statusText}>{status}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          disabled={isSaving}
          onPress={handleSave}
          style={[styles.saveButton, isSaving && styles.disabledButton]}>
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : isEditing ? 'Update configuration' : 'Build configuration'}
          </Text>
        </Pressable>
        <Link href="/configurations" style={styles.link}>
          View configurations
        </Link>
      </View>
    </AppShell>
  );
}

function formatApiError(error: ApiClientError) {
  if (error.status === 422) {
    return `${error.message}. Check that a case is selected and the parts are compatible.`;
  }

  return error.message;
}

const styles = StyleSheet.create({
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 18,
  },
  formCard: {
    backgroundColor: 'rgba(18, 17, 38, 0.94)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    marginBottom: 18,
    padding: 14,
  },
  input: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  visibilityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  visibilityButton: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  visibilityActive: {
    backgroundColor: 'rgba(48, 242, 255, 0.14)',
    borderColor: 'rgba(48, 242, 255, 0.55)',
  },
  visibilityText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  visibilityActiveText: {
    color: colors.accent,
  },
  grid: {
    gap: 12,
    marginBottom: 18,
  },
  categoryCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 17, 38, 0.94)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 16,
  },
  categoryCardActive: {
    borderColor: 'rgba(48, 242, 255, 0.65)',
  },
  categoryText: {
    flex: 1,
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
    lineHeight: 18,
    marginTop: 6,
  },
  removeButton: {
    borderColor: 'rgba(255, 91, 241, 0.6)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  removeButtonText: {
    color: colors.accentTwo,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  picker: {
    backgroundColor: 'rgba(15, 14, 27, 0.94)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    marginBottom: 18,
    padding: 14,
  },
  pickerHeader: {
    gap: 6,
  },
  pickerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  pickerMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  partList: {
    gap: 10,
  },
  partCard: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  partCardActive: {
    borderColor: 'rgba(48, 242, 255, 0.75)',
  },
  partName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  partMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  actions: {
    alignItems: 'flex-start',
    gap: 14,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  disabledButton: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
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
  errorText: {
    backgroundColor: 'rgba(255, 91, 241, 0.1)',
    borderColor: 'rgba(255, 91, 241, 0.45)',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.accentTwo,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 14,
    padding: 12,
  },
  statusText: {
    backgroundColor: 'rgba(48, 242, 255, 0.1)',
    borderColor: 'rgba(48, 242, 255, 0.45)',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 14,
    padding: 12,
  },
  stateBox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    marginBottom: 14,
    padding: 14,
  },
  stateText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
