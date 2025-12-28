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
  Dimensions,
  RefreshControl,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Asumsi path komponen & services ini sudah benar di project kamu
import FloatingButton from "../../../components/FloatingButton";
import BottomNav from "../../../components/BottomNav";
import { fetchDashboardData, fetchAnnouncements } from "../../../services/dashboard";
import { resolveImageUrl } from "../../../services/api";
// import API_BASE_URL from "../../../config/api";
// const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
import { fetchClasses, joinClass } from "../../../services/classes";

import ClassCard from "../../../components/ClassCard";

const COLORS = {
  primary: "#0B409C",
  secondary: "#FFC107",
  background: "#F5F6FA",
  white: "#FFFFFF",
  gray: "#E0E0E0",
  darkText: "#333333",
  lightGray: "#F0F0F0",
  mediumText: "#666666",
};

const StudentDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [joinedClasses, setJoinedClasses] = useState<any[]>([]);
  const [recommendedClasses, setRecommendedClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const dashboardData = await fetchDashboardData();
      const announcementsData = await fetchAnnouncements();
      const classesData = await fetchClasses('all');

      setUser(dashboardData.user);
      setAnnouncements(announcementsData);

      if (classesData) {
        // Filter classes based on logic (assuming backend returns all or split)
        // For now, let's assume fetchClasses returns joined classes or we filter them
        // If the API structure is different, we might need to adjust.
        // Based on previous context, let's split manually if needed or just set them.
        // Assuming fetchClasses returns list of classes with 'is_joined' property or similar?
        // Or maybe we need separate endpoints. For now, let's just set joinedClasses from dashboardData if available
        // or use fetchClasses result.

        const joined = classesData.filter((c: any) => c.is_joined);
        const recommended = classesData.filter((c: any) => !c.is_joined);

        setJoinedClasses(joined);
        setRecommendedClasses(recommended);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleJoinClass = async (classId: string) => {
    try {
      await joinClass(classId);
      Alert.alert("Sukses", "Berhasil bergabung ke kelas!");
      loadData();
    } catch (error) {
      Alert.alert("Error", "Gagal bergabung ke kelas");
    }
  };

  const handleAccessClass = (classId: string, className: string) => {
    router.push({
      pathname: "/(tabs)/students/classes/DetailClass",
      params: { classId, className }
    });
  };

  const handleViewAll = (tab: string) => {
    // Navigate to classes tab, optionally with correct filter
    router.push("/(tabs)/students/classes");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#004aad" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <LinearGradient
          colors={['#004aad', '#042b69']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greetingText}>Halo, Selamat Datang 👋</Text>
              <Text style={styles.userName}>{user?.full_name || 'Siswa'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.profileCircle, user?.profile_picture ? { backgroundColor: 'transparent', borderWidth: 0 } : {}]}
              onPress={() => router.push('/(tabs)/students/profile')}
            >
              {user?.profile_picture ? (
                <Image
                  source={{
                    uri: resolveImageUrl(user.profile_picture)!
                  }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
              ) : (
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
                </Text>
              )}
            </TouchableOpacity>
          </View >

          {/* Banner Image dengan Absolute Positioning */}
          < View style={styles.headerBannerWrapper} >
            <Image
              source={require('@/assets/dashboard/banner.png')}
              style={styles.headerBannerImage}
            />
          </View >
        </LinearGradient >

        {/* === ANNOUNCEMENTS === */}
        {
          announcements.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <View style={[styles.sectionHeader, { marginTop: 0 }]}>
                <Text style={styles.sectionTitle}>Pengumuman</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}
              >
                {announcements.map((announcement) => (
                  <View key={announcement.id} style={styles.announcementCard}>
                    <View style={styles.announcementHeader}>
                      <Ionicons name="notifications" size={18} color="#FFC107" />
                      <Text style={styles.announcementDate}>
                        {new Date(announcement.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </Text>
                    </View>
                    <Text style={styles.announcementTitle} numberOfLines={2}>{announcement.title}</Text>
                    <Text style={styles.announcementContent} numberOfLines={3}>{announcement.content}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )
        }

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
                  onPress={() => handleAccessClass(item.id, item.name)}
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
      </ScrollView >

      <FloatingButton />

      <BottomNav activeTab="home" />
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 50,
    paddingHorizontal: 20,
    paddingBottom: 80, // Space for banner
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 10,
  },
  greetingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 5,
  },
  userName: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  // --- OLD STYLES KEPT FOR COMPATIBILITY IF NEEDED OR REFACTORED ABOVE ---
  // header: { ... },
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

  // --- ANNOUNCEMENT STYLES ---
  announcementCard: {
    width: 280,
    backgroundColor: '#fff', // White card
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementDate: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500'
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  announcementContent: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
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

export default StudentDashboard;