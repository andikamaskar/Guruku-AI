import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="Login/index" options={{ headerShown: false }} />
      <Stack.Screen name="Register/index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modals/index" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}
