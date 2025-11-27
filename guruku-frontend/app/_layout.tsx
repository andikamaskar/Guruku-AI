import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack initialRouteName="OnBoarding/index">
    <Stack.Screen name="OnBoarding/index" options={{ headerShown: false }} />
    <Stack.Screen name="Login/login" options={{ headerShown: false }} />
    <Stack.Screen name="Register/register" options={{ headerShown: false }} />
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="modals/modal" options={{ presentation: 'modal', headerShown: false }} />
</Stack>

  );
}
