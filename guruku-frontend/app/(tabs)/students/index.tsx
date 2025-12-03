import React, { useState, useEffect } from "react";
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
// Pastikan path ini sesuai
import BottomNav from "../../../components/BottomNav";

import { fetchDashboardData } from "../../../services/dashboard";

// === 1. DEFINISI TIPE DATA (INTERFACES) === //
interface ClassItem {
  id: string; // Updated to string for UUID
  name: string; // Changed from title to name to match backend
  description?: string;
  teacher_name: string; // Changed from guru to teacher_name
  invite_code: string; // Changed from kodeKelas to invite_code
  students_count?: number;
  // Fields below might need to be computed or added to backend if needed
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
const ClassCard: React.FC<ClassCardProps> = ({
  id,
  title,
  guru,
  image,
  isJoined,
  progress,
  onJoin,
  kodeKelas,
}) => {
  return (
    <View style={styles.classCardContent}>
      <View style={styles.imageWrapper}>
        <View style={styles.emptyClassImage}>
          {image ? (
            <Image source={image} style={styles.cardImageActual} />
          ) : (
            <Text style={{ color: COLORS.mediumText, fontSize: 10 }}>
              {kodeKelas}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.textWrapper}>
        <View>
          <Text style={styles.classTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.classGuru}>{guru}</Text>
          <Text style={styles.classCode}>{kodeKelas}</Text>
        </View>

        {isJoined ? (
          <View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` as any },
                  { backgroundColor: COLORS.primary },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: COLORS.primary }]}>
              {progress}% Progress
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={(e: GestureResponderEvent) => {
              e.stopPropagation();
              onJoin(id);
            }}
          >
            <Text style={styles.joinButtonText}>Gabung Sekarang</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function KelasScreen() {
  const [joinedClasses, setJoinedClasses] = useState<ClassItem[]>([]);
  const [recommendedClasses, setRecommendedClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // === LOGIKA BACK HANDLER (KONFIRMASI KELUAR) ===
  useEffect(() => {
    const backAction = () => {
      Alert.alert("Konfirmasi Keluar", "Apakah Anda yakin ingin keluar dari aplikasi?", [
        {
          text: "Batal",
          onPress: () => null,
          style: "cancel",
        },
        { text: "YA", onPress: () => BackHandler.exitApp() },
      ]);
      return true; // Mencegah aksi back default (langsung keluar)
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Membersihkan event listener saat component di-unmount
  }, []);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardData();
      setUser(data.user);

      // Map backend data to frontend structure
      // Note: Backend returns 'joined_classes' inside user object
      const joined = data.user.joined_classes.map((cls: any) => ({
        ...cls,
        isJoined: true,
        progress: 0, // Default progress 0 for now
        image: null, // Default null image
      }));

      const recommended = data.recommended_classes.map((cls: any) => ({
        ...cls,
        isJoined: false,
        progress: 0,
        image: null,
      }));

      setJoinedClasses(joined);
      setRecommendedClasses(recommended);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      Alert.alert("Error", "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = (classId: string) => {
    // Implement join logic here later
    alert("Fitur gabung kelas belum diimplementasikan di backend!");
  };

  const handleAccessClass = (classId: string) => {
    console.log(`Navigasi ke kelas ID: ${classId}`);
    // Implement navigation logic
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Set StatusBar agar transparan/sesuai tema */}
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={true} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* === HEADER === */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Halo, {user?.full_name || 'Student'}</Text>
              <Text style={styles.headerSubtitle}>
                Selamat belajar kembali!
              </Text>
            </View>
            <TouchableOpacity style={styles.profileCircle}>
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerBannerWrapper}>
            <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          </View>
        </View>

        {/* === MY ACTIVITY === */}
        <View style={styles.activityCard}>
          <View style={styles.activityRow}>
            <View style={styles.activityLeft}>
              <View style={styles.activityImage}></View>
            </View>
            <View style={styles.activityRight}>
              <Text style={styles.activityTitle}>My Activities</Text>
              <Text style={styles.activitySubtitle}>
                Cek progres kelas tugas kamu disini
              </Text>
              <TouchableOpacity style={styles.seeButton}>
                <Text style={styles.seeButtonText}>Lihat &gt;</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* === SECTION 1: KELAS YANG DIIKUTI === */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lanjutkan Belajar</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.classGrid}>
            {loading ? (
              <Text style={{ padding: 20, color: COLORS.mediumText }}>Memuat kelas...</Text>
            ) : joinedClasses.length > 0 ? (
              joinedClasses.map((item) => (
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
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Cari Lainnya</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.classGrid}>
            {loading ? (
              <Text style={{ padding: 20, color: COLORS.mediumText }}>Memuat rekomendasi...</Text>
            ) : recommendedClasses.length > 0 ? (
              recommendedClasses.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.cardWrapperTouchable}
                  onPress={() => { }} // Rekomendasi belum bisa diakses langsung, harus join dulu
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

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  // --- STYLE HEADER DENGAN FIX SAFE AREA ---
  header: {
    backgroundColor: COLORS.primary,
    // Di sini logikanya: Jika Android, ambil tinggi status bar + 20px padding.
    // Jika iOS, default 50px (atau bisa disesuaikan).
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 50,
    paddingHorizontal: 20,
    paddingBottom: 25,
    marginBottom: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

  headerBannerWrapper: {
    marginTop: 20,
    width: "100%",
    height: 120,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
  },
  headerBannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
  activityImage: {
    width: "100%",
    height: 140,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
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
    width: "47%",
    marginBottom: 20,
  },
  classCardContent: {
    borderRadius: 15,
    padding: 0,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    minHeight: 260,
    overflow: "hidden",
  },
  imageWrapper: {
    width: "100%",
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 0,
    padding: 5,
  },
  emptyClassImage: {
    width: "90%",
    height: 110,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardImageActual: { width: "100%", height: "100%", borderRadius: 10 },
  textWrapper: {
    flex: 1,
    justifyContent: "space-between",
    marginTop: 10,
    marginHorizontal: 12,
    paddingBottom: 10,
  },
  classTitle: { fontSize: 13, fontWeight: "700", color: COLORS.darkText },
  classGuru: { fontSize: 11, color: "#666", marginTop: 2 },

  classCode: {
    fontSize: 10,
    color: COLORS.mediumText,
    marginTop: 2,
    fontStyle: "italic",
  },

  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginTop: 8,
  },
  progressFill: {
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 2,
  },

  joinButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  joinButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
});