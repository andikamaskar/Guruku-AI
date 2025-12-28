import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

export default function TabsIndexRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const role = await AsyncStorage.getItem("role");
        if (role === "student") {
          router.replace("/students");
        } else if (role === "teacher") {
          router.replace("/teachers");
        } else {
          router.replace("/Login");
        }
      } catch (error) {
        console.error("Failed to fetch role", error);
        router.replace("/Login");
      } finally {
        setLoading(false);
      }
    };
    checkRole();
  },);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0B409C" />
      </View>
    );
  }

  return null;
}
