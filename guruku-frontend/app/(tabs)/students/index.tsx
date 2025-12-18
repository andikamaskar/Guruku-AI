import React, { useState, useEffect } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageSourcePropType,
  GestureResponderEvent,
  Platform,
  StatusBar,
  BackHandler,
  Alert,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

// Asumsi path komponen & services ini sudah benar di project kamu
import FloatingButton from "../../../components/FloatingButton";
import BottomNav from "../../../components/BottomNav";
import { fetchDashboardData } from "../../../services/dashboard";
import API_BASE_URL from "../../../config/api";
import { fetchClasses, joinClass } from "../../../services/classes";

// === 1. DEFINISI TIPE DATA (INTERFACES) === //
interface ClassItem {
  id: string;
  name: string;
  description?: string;
  teacher_name: string;
  invite_code: string;
  students_count?: number;
  image?: ImageSourcePropType | null;
  isJoined?: boolean;
  progress?: number;
}

interface ClassCardProps {
  id: string;
  title: string;
  guru: string;
  image?: ImageSourcePropType | null;
  isJoined: boolean;
  progress: number;
  kodeKelas: string;
  onJoin: (id: string) => void;
}

const COLORS = {
  primary: "#0B409C",
  lightGray: "#E0E0E0",
  secondary: "#FFC107",
  darkText: "#333",
  mediumText: "#666",
  bg: "#F5F6FA",
};

// === KOMPONEN CLASS CARD === //
import Ionicons from "@expo/vector-icons/Ionicons";

import ClassCard from "../../../components/ClassCard";

// === SCREEN UTAMA === //
export default function KelasScreen() {
  const router = useRouter();
  const [joinedClasses, setJoinedClasses] = useState<ClassItem[]>([]);
  const [recommendedClasses, setRecommendedClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [allClasses, setAllClasses] = useState<any[]>([]);

  const handleViewAll = (tabName: 'joined' | 'suggested') => {
    router.push({
      pathname: "/students/classes", // Pastikan path ini sesuai dengan file classes/index.tsx kamu
      params: { initialTab: tabName } // Kita kirim data tab yang mau dibuka
    });
  };

  // === LOGIKA BACK HANDLER ===
  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        Alert.alert("Konfirmasi Keluar", "Apakah Anda yakin ingin keluar dari aplikasi?", [
          {
            text: "Batal",
            onPress: () => null,
            style: "cancel",
          },
          { text: "YA", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [])
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch user data for header
      const userData = await fetchDashboardData();
      setUser(userData.user);

      // Fetch classes
      const joined = await fetchClasses('joined');
      const all = await fetchClasses('all');

      // Filter: Recommended = All matching grade (from backend) MINUS Joined
      // Backend 'all' returns classes matching student grade.
      // Frontend ensures we don't show classes already joined in the 'Recommended' section.
      const joinedIds = new Set(joined.map((c: any) => c.id));
      const recommended = all.filter((c: any) => !joinedIds.has(c.id));

      setJoinedClasses(joined);
      setRecommendedClasses(recommended);
      setAllClasses(all);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      Alert.alert("Error", "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (code: string) => {
    try {
      await joinClass(code);
      Alert.alert("Sukses", "Berhasil bergabung ke kelas!");
      loadData(); // Reload data
    } catch (error) {
      Alert.alert("Error", "Gagal bergabung ke kelas");
    }
  };

  const handleAccessClass = (classId: string) => {
    const selectedClass = joinedClasses.find((c) => c.id === classId) ||
      recommendedClasses.find((c) => c.id === classId);

    if (selectedClass) {
      router.push({
        pathname: "/(tabs)/students/classes/DetailClass",
        params: {
          classId: classId,
          className: selectedClass.name
        }
      });
    } else {
      console.log("Data kelas tidak ditemukan untuk ID:", classId);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={true} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* === HEADER === */}
        <LinearGradient
          colors={["#005DFF", "#0B409C"]} // atas → bawah
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Halo, {user?.full_name || 'Student'}</Text>
              <Text style={styles.headerSubtitle}>
                Selamat belajar kembali!
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.profileCircle, user?.profile_picture ? { backgroundColor: 'transparent', borderWidth: 0 } : {}]}
              onPress={() => router.push('/(tabs)/students/profile')}
            >
              {user?.profile_picture ? (
                <Image
                  source={{
                    uri: (user.profile_picture.startsWith('http')
                      ? user.profile_picture
                      : `${API_BASE_URL.replace('/api', '')}${user.profile_picture}`) + `?t=${new Date().getTime()}`
                  }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
              ) : (
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Banner Image dengan Absolute Positioning */}
          <View style={styles.headerBannerWrapper}>
            <Image
              source={require('@/assets/dashboard/banner.png')}
              style={styles.headerBannerImage}
            />
          </View>
        </LinearGradient>

        {/* === MY ACTIVITY === */}
        <View style={styles.activityCard}>
          <View style={styles.activityRow}>
            <View style={styles.activityLeft}>
              {/* PERBAIKAN DI SINI: Menghapus spasi dan memisahkan style */}
              <View style={styles.activityImageWrapper}>
                <Image
                  source={require('@/assets/dashboard/Activityimg.png')}
                  style={styles.activityImageContent}
                />
              </View>
            </View>
            <View style={styles.activityRight}>
              <Text style={styles.activityTitle}>My Activities</Text>
              <Text style={styles.activitySubtitle}>
                Cek progres kelas tugas kamu disini
              </Text>
              <TouchableOpacity style={styles.seeButton} onPress={() => router.push('/(tabs)/students/activities')}>
                <Text style={styles.seeButtonText}>Lihat &gt;</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* === SECTION 1: KELAS YANG DIIKUTI === */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lanjutkan Belajar</Text>
            <TouchableOpacity onPress={() => handleViewAll('joined')}>
              <Text style={styles.sectionLink}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.classGrid}>
            {loading ? (
              <Text style={{ padding: 20, color: COLORS.mediumText }}>Memuat kelas...</Text>
            ) : joinedClasses.length > 0 ? (
              joinedClasses.slice(0, 2).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.cardWrapperTouchable}
                  onPress={() => handleAccessClass(item.id)}
                  activeOpacity={0.7}
                >
                  <ClassCard
                    id={item.id}
                    title={item.name}
                    guru={item.teacher_name}
                    image={item.image}
                    isJoined={true}
                    progress={item.progress || 0}
                    onJoin={handleJoinClass}
                    kodeKelas={item.invite_code}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ padding: 20, color: COLORS.mediumText }}>Belum ada kelas yang diikuti.</Text>
            )}
          </View>
        </View>

        {/* === SECTION 2: REKOMENDASI === */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rekomendasi Untukmu</Text>
            <TouchableOpacity onPress={() => handleViewAll('suggested')}>
              <Text style={styles.sectionLink}>Cari Lainnya</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.classGrid}>
            {loading ? (
              <Text style={{ padding: 20, color: COLORS.mediumText }}>Memuat rekomendasi...</Text>
            ) : recommendedClasses.length > 0 ? (
              recommendedClasses.slice(0, 2).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.cardWrapperTouchable}
                  onPress={() => { }}
                  activeOpacity={1}
                >
                  <ClassCard
                    id={item.id}
                    title={item.name}
                    guru={item.teacher_name}
                    image={item.image}
                    isJoined={false}
                    progress={0}
                    onJoin={handleJoinClass}
                    kodeKelas={item.invite_code}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ padding: 20, color: COLORS.mediumText }}>Tidak ada rekomendasi saat ini.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <FloatingButton />

      <BottomNav activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  // --- STYLE HEADER BARU (Sesuai Figma) ---
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 50,
    paddingHorizontal: 20,
    height: 250,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    zIndex: 10,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },
  headerSubtitle: { color: "#e7e7e7", fontSize: 14, marginTop: 2 },
  profileCircle: {
    width: 40,
    height: 40,
    backgroundColor: "#1E5CE5",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  // Style untuk Gambar Banner (Absolute Position)
  headerBannerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1,
  },
  headerBannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    marginBottom: -5,
  },

  // --- ACTIVITY STYLES ---
  activityCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  activityRow: { flexDirection: "row", alignItems: "center" },
  activityLeft: { flex: 1, alignItems: "center", justifyContent: "center" },
  activityRight: { flex: 1.5, paddingLeft: 15, justifyContent: "center" },

  // Style Baru untuk Activity Image
  activityImageWrapper: {
    width: "100%",
    height: 140,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    overflow: 'hidden', // Penting agar gambar tidak keluar dari radius
  },
  activityImageContent: {
    width: "100%",
    height: "100%",
    resizeMode: 'cover',
  },

  activityTitle: { fontSize: 16, fontWeight: "700", color: COLORS.darkText },
  activitySubtitle: { fontSize: 12, color: "#444", marginTop: 4 },
  seeButton: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  seeButtonText: { color: "#fff", fontWeight: "700", fontSize: 11 },

  // --- SECTION HEADER ---
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  sectionLink: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },

  // --- Style Class Card ---
  classGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  cardWrapperTouchable: {
    width: "48%", // Slightly wider for better fill
    marginBottom: 20,
  },
});