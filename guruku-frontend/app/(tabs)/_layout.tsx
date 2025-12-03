import { Stack } from "expo-router";
import { useRoleGuard } from "../role_guard";

export default function TabsLayout() {
  useRoleGuard();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="students" />
      <Stack.Screen name="teachers" />
    </Stack>
  );
}
