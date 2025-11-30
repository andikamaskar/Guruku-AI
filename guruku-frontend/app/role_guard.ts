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

      if (role === "student" && isTeacherPage) {
        router.replace("/(tabs)/students");
      }

      if (role === "teacher" && isStudentPage) {
        router.replace("/(tabs)/teachers");
      }
    }

    checkRole();
  }, [pathname]);
}
