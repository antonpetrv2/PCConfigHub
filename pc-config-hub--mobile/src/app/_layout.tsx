import { Stack } from 'expo-router';

import { AuthProvider } from '@/auth/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: '#0c0b14' },
          headerShown: false,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="configurations" />
        <Stack.Screen name="builder" />
      </Stack>
    </AuthProvider>
  );
}
