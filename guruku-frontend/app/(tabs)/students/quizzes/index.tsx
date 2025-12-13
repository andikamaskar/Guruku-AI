import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FloatingButton from "../../../../components/FloatingButton";
import BottomNav from "../../../../components/BottomNav";

// Import Service API
import { fetchDashboardData } from "../../../../services/dashboard";
import { fetchClasses } from "../../../../services/classes";
import API_BASE_URL from "../../../../config/api";

const COLORS = {
  primary: "#0B409C",
  lightGray: "#E0E0E0",
  secondary: "#FFC107",
  darkText: "#333",
  mediumText: "#666",
  bg: "#F5F6FA",
};

interface ClassCardProps {
  id: string | number;
  title: string;
  guru: string;
  image: any;
  isJoined: boolean;
  progress: number;
  onJoin: (id: string | number) => void;
  kodeKelas: string;
}

function ClassCard({
  id,
  title,
  guru,
  image,
  isJoined,
  progress,
  onJoin,
  kodeKelas,
}: ClassCardProps) {
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

        <View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
                { backgroundColor: COLORS.primary },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: COLORS.primary }]}>
            {progress}% Progress
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function KelasScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State untuk Data
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // === 1. FETCH DATA DARI DATABASE ===
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Ambil Data User (untuk Header)
      const dashboardData = await fetchDashboardData();
      setUser(dashboardData.user);

      // Ambil Daftar Kelas (Joined Classes)
      // Kita asumsikan tab Quizzes/Activities menampilkan kelas yang sudah diikuti
      const classesData = await fetchClasses("joined");

      // Mapping data dari API ke format State lokal
      const formattedClasses = classesData.map((cls: any) => ({
        id: cls.id,
        title: cls.name, // API: name -> UI: title
        image: cls.image || null,
        guru: cls.teacher_name, // API: teacher_name -> UI: guru
        isJoined: true, // Karena fetch 'joined', pasti true
        progress: 0, // Backend belum ada progress, default 0
        kodeKelas: cls.invite_code, // API: invite_code -> UI: kodeKelas
        lastAccessed: Date.now(), // Mock waktu akses agar urutan tetap jalan
      }));

      setKelasList(formattedClasses);
    } catch (error) {
      console.error("Gagal memuat data:", error);
      Alert.alert("Error", "Gagal memuat data kelas.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = (classId: number | string) => {
    // Fungsi ini mungkin jarang dipakai di halaman ini karena listnya sudah 'Joined'
    // Tapi kita biarkan untuk kompatibilitas
    console.log("Join Class ID:", classId);
  };

  const handleAccessClass = (classId: number | string) => {
    const selectedClass = kelasList.find((c) => c.id === classId);

    // Navigasi ke Detail Kelas (Menggunakan logic yang sama dengan file sebelumnya)
    if (selectedClass) {
      router.push({
        pathname: "/students/classes/DetailClass",
        params: {
          classId: classId,
          className: selectedClass.title
        }
      });
    }
  };

  // === 2. FILTERING ===
  const filteredClasses = kelasList.filter((kelas) => {
    const query = searchQuery.toLowerCase();
    if (query === "") return true;

    return (
      kelas.title.toLowerCase().includes(query) ||
      kelas.guru.toLowerCase().includes(query) ||
      kelas.kodeKelas.toLowerCase().includes(query)
    );
  });

  // Sorting berdasarkan lastAccessed (jika diperlukan)
  const displayedClasses = [...filteredClasses].sort((a, b) => {
    const tA = a.lastAccessed || 0;
    const tB = b.lastAccessed || 0;
    return tB - tA;
  });

  const sectionTitleText = searchQuery ? "Hasil Pencarian" : "Kelas Anda";

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#005DFF", "#0B409C"]} // atas → bawah
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              {/* Gunakan Data User Dinamis */}
              <Text style={styles.headerTitle}>Halo, {user?.full_name || "Student"}</Text>
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
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "S"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.searchWrapper, { marginTop: 20 }]}>
            <TextInput
              placeholder="Cari Kelas Anda"
              placeholderTextColor="#d6d6d6"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </LinearGradient>

        {/* ACTIVITIES */}
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
                <Text style={styles.seeButtonText}>Lihat </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{sectionTitleText}</Text>

        <View style={styles.classGrid}>
          {loading ? (
            <Text style={{ padding: 20, color: COLORS.mediumText }}>Memuat data...</Text>
          ) : displayedClasses.length > 0 ? (
            displayedClasses.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.cardWrapperTouchable}
                onPress={() => handleAccessClass(item.id)}
                activeOpacity={0.7}
              >
                <ClassCard
                  {...item}
                  onJoin={handleJoinClass}
                />
              </TouchableOpacity>
            ))
          ) : (
            <View
              style={{
                width: "100%",
                padding: 20,
                alignItems: "center",
              }}
            >
              <Text style={{ color: COLORS.mediumText }}>
                {searchQuery ? "Tidak ada kelas ditemukan." : "Anda belum mengikuti kelas apapun."}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingButton />

      <BottomNav activeTab="quizzes" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  searchWrapper: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Sedikit transparan agar lebih modern
    borderRadius: 10,
    paddingHorizontal: 6,
    height: 46,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)"
  },
  searchInput: { flex: 1, paddingHorizontal: 15, fontSize: 16, color: "white" },
  sectionTitle: {
    marginTop: 25,
    marginLeft: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
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
    borderRadius: 12
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