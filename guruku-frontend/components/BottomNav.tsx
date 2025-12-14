import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

interface BottomNavProps {
  activeTab?: 'home' | 'classes' | 'quizzes' | 'profile';
  role?: 'student' | 'teacher';
  onTabPress?: (tab: string) => void; // Optional if we want to handle custom logic
}

export default function BottomNav({ activeTab = 'home', role = 'student' }: BottomNavProps) {
  const router = useRouter();

  const navigateTo = (route: string) => {
    router.push(route as any);
  };

  const basePath = role === 'teacher' ? '/(tabs)/teachers' : '/(tabs)/students';

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigateTo(`${basePath}`)}>
        <Image
          source={require("../assets/dashboard/Home-Icon.png")}
          style={activeTab === 'home' ? styles.icon : styles.iconGray}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigateTo(`${basePath}/classes`)}>
        <Image
          source={require("../assets/dashboard/Class-Icon.png")}
          style={activeTab === 'classes' ? styles.icon : styles.iconGray}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigateTo(`${basePath}/quizzes`)}>
        <Image
          source={require("../assets/dashboard/Quizz-Icon.png")}
          style={activeTab === 'quizzes' ? styles.icon : styles.iconGray}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigateTo(`${basePath}/profile`)}>
        <Image
          source={require("../assets/dashboard/Profile-Icon.png")}
          style={activeTab === 'profile' ? styles.icon : styles.iconGray}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,

    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",

    elevation: 20,
    zIndex: 999,
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: "#0B409C", // Primary color for active
  },
  iconGray: {
    width: 28,
    height: 28,
    opacity: 0.5, // Grayed out
    tintColor: "#333", // Ensure it's dark gray
  },
});
