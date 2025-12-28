// Lokasi: app/(tabs)/students/quizzes/index.tsx

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
import { Ionicons } from "@expo/vector-icons";
import FloatingButton from "../../../../components/FloatingButton"; // Sesuaikan path jika perlu
import BottomNav from "../../../../components/BottomNav"; // Sesuaikan path jika perlu

// Import Service API
import { fetchDashboardData } from "../../../../services/dashboard";
import { fetchClasses } from "../../../../services/classes";
import { fetchStudentQuizzes, Quiz } from "../../../../services/quizzes"; // Import Quiz Service
// import API_BASE_URL from "../../../../config/api";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

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
            <LinearGradient
              colors={['#ffffff', '#E1F5FE']}
              style={styles.placeholderGradient}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="book" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.placeholderCodeLabel}>KODE KELAS</Text>
              <Text style={styles.placeholderCodeValue}>{kodeKelas}</Text>
            </LinearGradient>
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

  // Active Quizzes State
  const [activeQuizzes, setActiveQuizzes] = useState<Quiz[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // === 1. FETCH DATA DARI DATABASE ===
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadingActivities(true);

      const dashboardData = await fetchDashboardData();
      setUser(dashboardData.user);

      // Fetch Classes and Quizzes in Parallel
      const [classesData, quizzes] = await Promise.all([
        fetchClasses("joined"),
        fetchStudentQuizzes()
      ]);

      // Calculate Progress & Format Classes
      const formattedClasses = classesData.map((cls: any) => {
        // Filter quizzes for this class
        const classQuizzes = quizzes.filter((q: Quiz) => q.class_id === cls.id);
        const totalQuizzes = classQuizzes.length;

        let completedQuizzes = 0;
        classQuizzes.forEach((q: Quiz) => {
          if (q.user_attempts_count && q.user_attempts_count > 0) {
            completedQuizzes++;
          }
        });

        const progress = totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0;

        return {
          id: cls.id,
          title: cls.name,
          image: cls.image || null,
          guru: cls.teacher_name,
          isJoined: true,
          progress: progress,
          kodeKelas: cls.invite_code,
          lastAccessed: Date.now(),
        };
      });

      setKelasList(formattedClasses);

      // Filter Active Quizzes for "My Activities"
      const now = new Date();
      const filtered = quizzes.filter((q: Quiz) => {
        // 1. Must be active
        if (!q.is_active) return false;

        // 2. Deadline must be in future (or null) - Handle Timezones if needed, but local comparison is usually ok for simple apps
        // If deadline is string, parse it.
        const deadlineDate = q.deadline ? new Date(q.deadline) : null;
        const isFuture = deadlineDate ? deadlineDate > now : true;

        // 3. Must have attempts remaining
        const attempts = q.user_attempts_count || 0;
        const max = q.max_attempts || 1;
        const hasAttempts = attempts < max;

        return isFuture && hasAttempts;
      });

      console.log('All Quizzes:', quizzes.length);
      console.log('Active Filtered:', filtered.length);

      setActiveQuizzes(filtered);

    } catch (error) {
      console.error("Gagal memuat data:", error);
      Alert.alert("Error", "Gagal memuat data kelas.");
    } finally {
      setLoading(false);
      setLoadingActivities(false);
    }
  };

  const handleJoinClass = (classId: number | string) => {
    console.log("Join Class ID:", classId);
  };

  // === PERUBAHAN UTAMA DI SINI ===
  const handleAccessClass = (classId: number | string) => {
    const selectedClass = kelasList.find((c) => c.id === classId);

    if (selectedClass) {
      // Mengarahkan ke file ListQuiz/index.tsx
      // Kita mengirim 'classCode' agar halaman quiz tahu kelas mana yang dibuka
      router.push({
        pathname: "/(tabs)/students/quizzes/ListQuiz",
        params: {
          classCode: selectedClass.kodeKelas,
          className: selectedClass.title,
          teacherName: selectedClass.guru
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
          colors={["#005DFF", "#0B409C"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
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

        {/* === ACTIVITIES BANNER === */}
        <View style={styles.activityCard}>
          <View style={styles.activityRow}>
            <View style={styles.activityLeft}>
              <View style={styles.activityImageWrapper}>
                <Image
                  source={require('@/assets/dashboard/Activityimg.png')}
                  style={styles.activityImageActual}
                />
              </View>
            </View>
            <View style={styles.activityRight}>
              <Text style={styles.activityTitle}>Aktivitas Saya</Text>
              <Text style={styles.activitySubtitle}>
                Lihat kuis dan tugas yang sedang berlangsung.
              </Text>
              {/* Toggle / Scroll Button */}
              <TouchableOpacity
                style={styles.seeButton}
                onPress={() => router.push('/(tabs)/students/quizzes/active')}
              >
                <Text style={styles.seeButtonText}>Lihat ({activeQuizzes.length})</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* === ACTIVE QUIZZES LIST (PREMIUM DESIGN) === */}
        {activeQuizzes.length > 0 && (
          <View style={styles.activeSection}>
            <Text style={styles.sectionTitle}>Sedang Berjalan</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeScroll}>
              {activeQuizzes.map((quiz) => (
                <TouchableOpacity
                  key={quiz.id}
                  style={styles.premiumQuizCard}
                  onPress={() => router.push(`/(tabs)/students/quizzes/${quiz.id}/attempt`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeaderStrip} />
                  <View style={styles.cardContent}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{quiz.duration_minutes} Menit</Text>
                      </View>
                      <View style={[styles.badgeContainer, { backgroundColor: '#E3F2FD' }]}>
                        <Text style={[styles.badgeText, { color: COLORS.primary }]}>{quiz.class_name}</Text>
                      </View>
                    </View>

                    <Text style={styles.cardTitle} numberOfLines={2}>{quiz.title}</Text>

                    <View style={styles.cardFooter}>
                      <Text style={styles.attemptText}>
                        <Text style={{ fontWeight: 'bold' }}>{quiz.user_attempts_count || 0}</Text>/{quiz.max_attempts} Percobaan
                      </Text>
                      <View style={styles.startButton}>
                        <Text style={styles.startButtonText}>Kerjakan</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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
    borderRadius: 12,
    // Removed solid gray background, now using gradient child
    marginBottom: 0, // Adjusted margins
    overflow: 'hidden',
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'white', // Fallback
    elevation: 2
  },
  placeholderGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  },
  iconCircle: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6
  },
  placeholderCodeLabel: {
    fontSize: 8,
    color: '#888',
    letterSpacing: 1,
    fontWeight: 'bold',
    marginBottom: 2
  },
  placeholderCodeValue: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
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
  },

  // --- PREMIUM QUIZ CARD STYLES ---
  activeSection: { marginTop: 10, marginBottom: 10 },
  activeScroll: { paddingHorizontal: 20, paddingBottom: 15 },

  premiumQuizCard: {
    width: 260,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 15,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1, borderColor: '#f0f0f0'
  },
  cardHeaderStrip: {
    height: 6,
    width: '100%',
    backgroundColor: COLORS.secondary // Gold color
  },
  cardContent: { padding: 15 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  badgeContainer: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#FFA000' },

  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5, height: 44 },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5'
  },
  attemptText: { fontSize: 11, color: '#888' },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  startButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

  // --- RESTORED ACTIVITY BANNER STYLES ---
  activityImageWrapper: {
    width: "100%",
    height: 140,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    overflow: 'hidden'
  },
  activityImageActual: {
    width: "100%",
    height: "100%",
    resizeMode: 'cover'
  },

  // --- MY ACTIVITY NEW STYLES ---
  activitySection: { marginBottom: 10 },
  sectionHeader: { marginTop: 25, marginBottom: 15, marginLeft: 20 },
  activitiesScroll: { paddingHorizontal: 20, paddingBottom: 20 },

  activeQuizCard: {
    width: 160,
    height: 170,
    marginRight: 15,
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#FFC107",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  quizCardGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 15,
    justifyContent: 'space-between'
  },
  quizCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  quizTimeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  quizTitleText: { color: 'white', fontSize: 16, fontWeight: 'bold', lineHeight: 20, marginBottom: 5 },
  quizClassText: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },

  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 10
  },
  quizButtonText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 12 },

  // Empty State
  activityCardEmpty: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 15,
    backgroundColor: "#fff",
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.05,
    elevation: 2
  }
});