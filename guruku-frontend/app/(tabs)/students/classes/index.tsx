import React, { useState, useEffect } from "react";
// Gabungkan import dari expo-router
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
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
import API_BASE_URL from "../../../../config/api";

const COLORS = {
  primary: "#0B409C",
  lightGray: "#E0E0E0",
  secondary: "#FFC107",
  darkText: "#333",
  mediumText: "#666",
  bg: "#F5F6FA",
};

import ClassCard from "../../../../components/ClassCard";

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

  // Gunakan useFocusEffect untuk refresh data saat kembali ke layar ini
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

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
        pathname: "/(tabs)/students/classes/DetailClass",
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
                  title={item.name}
                  guru={item.teacher_name}
                  kodeKelas={item.invite_code}
                  isJoined={activeTab === 'joined'}
                  progress={item.progress || 0}
                  onJoin={() => handleJoinClass(item.invite_code)}
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
    paddingHorizontal: 6,
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
    width: "48%",
    marginBottom: 20,
  },
});
