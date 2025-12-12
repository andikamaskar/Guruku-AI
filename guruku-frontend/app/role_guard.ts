import { useEffect } from "react";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useRoleGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkRole() {
      const role = await AsyncStorage.getItem("role");

      if (!role) return; // belum login → biarkan login page handle

      const isStudentPage = pathname.startsWith("/(tabs)/students");
      const isTeacherPage = pathname.startsWith("/(tabs)/teachers");

      if (role === "student") {
        if (isTeacherPage) {
          router.replace("/(tabs)/students");
        }

        // Verification Check
        const isVerified = await AsyncStorage.getItem("is_verified") === "true";
        // Allow access to Profile to let them verify
        const isProfilePage = pathname.includes("profile");

        if (!isVerified && !isProfilePage) {
          // Alert.alert("Action Required", "Please verify your account in Profile."); // Alert might loop or be annoying
          // We can't really Alert in useEffect easily without loops, better just redirect
          router.replace("/(tabs)/students/profile");
        }
      }

      if (role === "teacher" && isStudentPage) {
        router.replace("/(tabs)/teachers");
      }

      // Admin Guard
      const isAdminPage = pathname.startsWith("/admin");
      if (isAdminPage && role !== "admin") {
        router.replace("/Login"); // Or back to their dashboard
      }
      if (role === "admin" && !isAdminPage) {
        // Optional: Force admin to admin panel if they try to access student stuff?
        // For now let's just protect admin pages.
      }
    }

    checkRole();
  }, [pathname]);
}
