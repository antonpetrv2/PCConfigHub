import { Link, usePathname, useRouter } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

type AppShellProps = PropsWithChildren<{
  title?: string;
  showBack?: boolean;
}>;

export function AppShell({ children, title, showBack = false }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Link href="/" style={styles.brand}>
            PCConfigHub
          </Link>
          {showBack ? (
            <Pressable onPress={goBack} style={styles.backButton}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.nav}>
          <NavLink href="/" label="Home" active={pathname === '/'} />
          <NavLink
            href="/configurations"
            label="Configurations"
            active={pathname === '/configurations'}
          />
          <NavLink href="/builder" label="Builder" active={pathname === '/builder'} />
          <NavLink href="/login" label="Login" active={pathname === '/login'} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        {title ? <Text style={styles.screenTitle}>{title}</Text> : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function NavLink({
  href,
  label,
  active,
}: {
  href: '/' | '/configurations' | '/builder' | '/login';
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href} style={[styles.navLink, active && styles.navLinkActive]}>
      {label}
    </Link>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.panelStrong,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  brand: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  backButton: {
    borderColor: colors.accentTwo,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backText: {
    color: colors.accentTwo,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  nav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  navLink: {
    borderRadius: 999,
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 9,
    textTransform: 'uppercase',
  },
  navLinkActive: {
    backgroundColor: 'rgba(48, 242, 255, 0.12)',
    color: colors.accent,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    width: '100%',
  },
  screenTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    marginBottom: 18,
  },
});
