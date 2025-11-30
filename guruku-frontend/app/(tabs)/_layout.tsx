import { Tabs } from "expo-router";
import { useRoleGuard } from "../role_guard";

export default function TabsLayout() {
  useRoleGuard();
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="students" options={{ title: "Students" }} />
      <Tabs.Screen name="teachers" options={{ title: "Teachers" }} />
    </Tabs>
  );
}
