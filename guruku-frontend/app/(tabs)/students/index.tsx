import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
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
import BottomNav from "../../../components/BottomNav";
import { fetchDashboardData } from "../../../services/dashboard";

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
      <LinearGradient
        colors={["#0B409C", "#0A2D69"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.imageWrapper}
      >
        <View style={styles.emptyClassImage}>
          {image ? (
            <Image source={image} style={styles.cardImageActual} />
          ) : (
            <Text style={{ color: COLORS.mediumText, fontSize: 10 }}>
              {kodeKelas}
            </Text>
          )}
        </View>
      </LinearGradient>

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

// === SCREEN UTAMA === //
export default function KelasScreen() {
  const router = useRouter();
  const [joinedClasses, setJoinedClasses] = useState<ClassItem[]>([]);
  const [recommendedClasses, setRecommendedClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // === LOGIKA BACK HANDLER ===
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
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardData();
      setUser(data.user);

      const joined = data.user.joined_classes.map((cls: any) => ({
        ...cls,
        isJoined: true,
        progress: 0,
        image: null,
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
    alert("Fitur gabung kelas belum diimplementasikan di backend!");
  };

  const handleAccessClass = (classId: string) => {
    console.log(`Navigasi ke kelas ID: ${classId}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={true} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* === HEADER === */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Halo, {user?.full_name || 'Student'}</Text>
              <Text style={styles.headerSubtitle}>
                Selamat belajar kembali!
              </Text>
            </View>
            <TouchableOpacity
              style={styles.profileCircle}
              onPress={() => router.push('/(tabs)/students/profile')}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Banner Image dengan Absolute Positioning */}
          <View style={styles.headerBannerWrapper}>
            <Image
              source={require('@/assets/dashboard/banner.png')}
              style={styles.headerBannerImage}
            />
          </View>
        </View>

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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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