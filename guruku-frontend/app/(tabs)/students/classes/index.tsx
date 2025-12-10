import React, { useState, useEffect } from "react";
// Gabungkan import dari expo-router
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
// Pastikan path import ini benar sesuai struktur project Anda
import FloatingButton from "../../../../components/FloatingButton";
import BottomNav from "../../../../components/BottomNav";
import { fetchClasses, joinClass } from "../../../../services/classes";
import { fetchDashboardData } from "../../../../services/dashboard";

const COLORS = {
  primary: "#0B409C",
  lightGray: "#E0E0E0",
  secondary: "#FFC107",
  darkText: "#333",
  mediumText: "#666",
  bg: "#F5F6FA",
};

// === CLASS CARD === //
interface ClassCardProps {
  id: string;
  name: string;
  teacher_name: string;
  invite_code: string;
  isJoined: boolean;
  progress?: number;
  onJoin: (code: string) => void;
  onPress: (id: string) => void;
}

function ClassCard({
  id,
  name,
  teacher_name,
  invite_code,
  isJoined,
  progress = 0,
  onJoin,
  onPress,
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
          <Text style={{ color: COLORS.mediumText, fontSize: 10 }}>
            {invite_code}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.textWrapper}>
        <View>
          <Text style={styles.classTitle} numberOfLines={2}>
            {name}
          </Text>
          <Text style={styles.classGuru}>{teacher_name}</Text>
          <Text style={styles.classCode}>{invite_code}</Text>
        </View>

        {isJoined ? (
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
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => onJoin(invite_code)}
          >
            <Text style={styles.joinButtonText}>Gabung</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function StudentClass() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // === PERBAIKAN STATE ===
  // Inisialisasi activeTab dengan mengecek params.initialTab terlebih dahulu
  const [activeTab, setActiveTab] = useState<"joined" | "suggested">(
    (params.initialTab as "joined" | "suggested") || "joined"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [joinedClasses, setJoinedClasses] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Efek untuk memantau perubahan params (jika navigasi terjadi saat halaman sudah mount)
  useEffect(() => {
    if (params.initialTab) {
      setActiveTab(params.initialTab as "joined" | "suggested");
    }
  }, [params.initialTab]);

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

      setJoinedClasses(joined);
      setAllClasses(all);
    } catch (error) {
      console.error("Failed to load classes:", error);
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
    // Cari data kelas
    const selectedClass = allClasses.find((c) => c.id === classId) || 
                          joinedClasses.find((c) => c.id === classId);

    if (selectedClass) {
      router.push({
        pathname: "/students/classes/DetailClass", 
        params: { 
          classId: classId, 
          className: selectedClass.name 
        }
      });
    }
  };

  // Filter logic
  const getDisplayedClasses = () => {
    let source = activeTab === "joined" ? joinedClasses : allClasses;

    // If suggested tab, filter out already joined classes from "all" list
    if (activeTab === "suggested") {
      const joinedIds = new Set(joinedClasses.map(c => c.id));
      source = source.filter(c => !joinedIds.has(c.id));
    }

    if (!searchQuery) return source;

    const q = searchQuery.toLowerCase();
    return source.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.teacher_name.toLowerCase().includes(q) ||
        c.invite_code.toLowerCase().includes(q)
    );
  };

  const displayedClasses = getDisplayedClasses();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={true} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* HEADER */}
        <LinearGradient
          colors={["#005DFF", "#0B409C"]} // atas → bawah
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Halo, {user?.full_name || 'Student'}</Text>
              <Text style={styles.headerSubtitle}>Apa yang ingin kamu pelajari</Text>
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

          <View style={[styles.searchWrapper, { marginTop: 20, zIndex: 10 }]}>
            <TextInput
              placeholder="Cari Kelas"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>

          <View style={styles.tabRowInHeader}>
            <TouchableOpacity
              style={
                activeTab === "joined"
                  ? styles.tabActiveInHeader
                  : styles.tabInactiveInHeader
              }
              onPress={() => setActiveTab("joined")}
            >
              <Text
                style={
                  activeTab === "joined"
                    ? styles.tabActiveTextInHeader
                    : styles.tabInactiveTextInHeader
                }
              >
                Kelas Yang Diikuti
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                activeTab === "suggested"
                  ? styles.tabActiveInHeader
                  : styles.tabInactiveInHeader
              }
              onPress={() => setActiveTab("suggested")}
            >
              <Text
                style={
                  activeTab === "suggested"
                    ? styles.tabActiveTextInHeader
                    : styles.tabInactiveTextInHeader
                }
              >
                Disarankan Untuk Anda
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>
          {activeTab === 'joined' ? 'Kelas Saya' : 'Rekomendasi Kelas'}
        </Text>

        <View style={styles.classGrid}>
          {loading ? (
            <Text style={{ padding: 20, color: COLORS.mediumText }}>Memuat kelas...</Text>
          ) : displayedClasses.length > 0 ? (
            displayedClasses.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.cardWrapperTouchable}
                onPress={() => activeTab === 'joined' && handleAccessClass(item.id)}
                activeOpacity={0.7}
              >
                <ClassCard
                  id={item.id}
                  name={item.name}
                  teacher_name={item.teacher_name}
                  invite_code={item.invite_code}
                  isJoined={activeTab === 'joined'}
                  progress={0} // Backend doesn't have progress yet
                  onJoin={handleJoinClass}
                  onPress={handleAccessClass}
                />
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ width: "100%", padding: 20, alignItems: "center" }}>
              <Text style={{ color: COLORS.mediumText }}>
                Tidak ada kelas ditemukan.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <FloatingButton />
      <BottomNav activeTab="classes" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 50,
    paddingHorizontal: 20,
    paddingBottom: 20, // Added padding bottom
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    // Removed fixed height and overflow
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
  // Removed headerBannerWrapper and headerBannerImage styles

  searchWrapper: {
    flexDirection: "row",
    backgroundColor: "#fff",
    elevation: 6,
    borderRadius: 10,
    padding: 6,
    height: 46,
  },
  searchInput: { flex: 1, paddingHorizontal: 15, fontSize: 16 },

  tabRowInHeader: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: 'center',
    zIndex: 10,
  },
  tabActiveInHeader: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.secondary,
  },
  tabActiveTextInHeader: {
    color: 'white',
    fontWeight: "bold"
  },
  tabInactiveInHeader: {
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  tabInactiveTextInHeader: {
    color: "#e7e7e7"
  },

  sectionTitle: {
    marginTop: 25,
    marginLeft: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

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
