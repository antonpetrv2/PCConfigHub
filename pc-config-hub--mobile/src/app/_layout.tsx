import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: '#0c0b14' },
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="configurations" />
      <Stack.Screen name="builder" />
    </Stack>
  );
}
