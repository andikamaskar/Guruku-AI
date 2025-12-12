import { Stack } from "expo-router";

export default function AdminLayout() {
    return (
        <Stack>
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        </Stack>
    );
}
