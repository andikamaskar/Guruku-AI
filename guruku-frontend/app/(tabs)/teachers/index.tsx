import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, StatusBar, Platform, RefreshControl, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../../../components/BottomNav';
import AnnouncementCard from '../../../components/AnnouncementCard';
import { fetchUserProfile } from '../../../services/user';
import { fetchTeacherDashboardData, fetchAnnouncements } from '../../../services/dashboard';
import API_BASE_URL from '../../../config/api';

const COLORS = {
  primary: "#0B409C",
  lightGray: "#E0E0E0",
  secondary: "#FFC107",
  darkText: "#333",
  mediumText: "#666",
  bg: "#F5F6FA",
};

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activeClasses: 0,
    totalStudents: 0,
    assignmentsPending: 0
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);

      // Execute all fetch requests in parallel
      const [profileData, dashboardData, announcementsData] = await Promise.all([
        fetchUserProfile(),
        fetchTeacherDashboardData(),
        fetchAnnouncements()
      ]);

      setUser(profileData);
      setStats(dashboardData);
      setAnnouncements(announcementsData);

    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const renderHeader = () => (
    <LinearGradient
      colors={["#005DFF", "#0B409C"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.header}
    >
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle}>Halo, {user?.full_name || 'Teacher'}</Text>
          <Text style={styles.headerSubtitle}>
            Selamat mengajar kembali!
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/(tabs)/teachers/profile')}
        >
          {user?.profile_picture ? (
            <Image
              source={{
                uri: (user.profile_picture.startsWith('http')
                  ? user.profile_picture
                  : `${API_BASE_URL.replace('/api', '')}${user.profile_picture}`) + `?t=${new Date().getTime()}`
              }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>{user?.full_name?.[0] || 'G'}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Banner / Stats Area styled similar to Student Activity Card but for Teacher Stats */}
      <View style={styles.statsCardWrapper}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.activeClasses}</Text>
            <Text style={styles.statLabel}>Kelas Aktif</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalStudents}</Text>
            <Text style={styles.statLabel}>Total Siswa</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.assignmentsPending}</Text>
            <Text style={styles.statLabel}>Tugas Baru</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {renderHeader()}

        <View style={styles.mainContent}>
          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Aksi Cepat</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/teachers/classes/create')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="add" size={24} color="#1565C0" />
              </View>
              <Text style={styles.actionText}>Buat Kelas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/teachers/classes')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="school-outline" size={24} color="#2E7D32" />
              </View>
              <Text style={styles.actionText}>Lihat Kelas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/teachers/quizzes/create')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="create-outline" size={24} color="#8E24AA" />
              </View>
              <Text style={styles.actionText}>Buat Kuis</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/teachers/quizzes')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="list-outline" size={24} color="#EF6C00" />
              </View>
              <Text style={styles.actionText}>List Kuis</Text>
            </TouchableOpacity>
          </View>

          {/* Announcements Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pengumuman Terbaru</Text>
            {/* <TouchableOpacity><Text style={styles.seeAllText}>Lihat Semua</Text></TouchableOpacity> */}
          </View>

          {announcements.length > 0 ? (
            announcements.map((item) => (
              <AnnouncementCard
                key={item.id}
                title={item.title}
                content={item.content}
                date={formatDate(item.created_at)}
                onPress={() => setSelectedAnnouncement(item)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={40} color="#ccc" />
              <Text style={styles.emptyText}>Belum ada pengumuman.</Text>
            </View>
          )}

        </View>
      </ScrollView>

      {/* Announcement Modal */}
      <Modal visible={!!selectedAnnouncement} transparent animationType="fade" onRequestClose={() => setSelectedAnnouncement(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="megaphone" size={24} color="#FF9800" />
              <Text style={styles.modalTitle}>Detail Pengumuman</Text>
            </View>

            {selectedAnnouncement && (
              <ScrollView>
                <Text style={styles.modalDate}>{formatDate(selectedAnnouncement.created_at)}</Text>
                <Text style={styles.modalTitleText}>{selectedAnnouncement.title}</Text>
                <Text style={styles.modalBodyText}>{selectedAnnouncement.content}</Text>
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedAnnouncement(null)}
            >
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav activeTab="home" role="teacher" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingBottom: 100
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 50,
    paddingHorizontal: 20,
    paddingBottom: 40, // Reduced padding bottom since stats card is moved up or overlapping
    height: 200,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'relative',
    marginBottom: 40, // Space for the overlapping card
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    zIndex: 10,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },
  headerSubtitle: { color: "#e7e7e7", fontSize: 14, marginTop: 2 },
  profileButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  profileImage: { width: 38, height: 38, borderRadius: 19 },
  profilePlaceholder: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  profileInitial: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },

  // Stats Card (Overlapping Header)
  statsCardWrapper: {
    position: 'absolute',
    bottom: -30,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: '#666', fontSize: 12, marginTop: 4 },
  statDivider: { width: 1, height: 30, backgroundColor: '#eee' },

  mainContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600'
  },

  // Quick Actions Grid
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 15,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
    textAlign: 'center'
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  emptyText: { color: '#999', marginTop: 10 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modalDate: { fontSize: 12, color: '#888', marginBottom: 5 },
  modalTitleText: { fontSize: 16, fontWeight: 'bold', color: '#0B409C', marginBottom: 10 },
  modalBodyText: { fontSize: 14, color: '#333', lineHeight: 22, marginBottom: 20 },
  closeButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  closeButtonText: { color: 'white', fontWeight: 'bold' }
});
