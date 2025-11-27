import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="students" options={{ title: "Students" }} />
      <Tabs.Screen name="teachers" options={{ title: "Teachers" }} />
    </Tabs>
  );
}
