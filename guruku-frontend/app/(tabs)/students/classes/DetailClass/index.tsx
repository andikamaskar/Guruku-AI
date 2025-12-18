import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
  Image,
  Dimensions,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../../../../../config/api';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Material {
  id: string;
  title: string;
  created_at: string;
  is_completed: boolean;
}

interface Announcement {
  id: string;
  content: string;
  created_at: string;
  teacher: number;
}

interface Student {
  id: number;
  full_name: string;
  email: string;
  avatar: string | null;
}

export default function DetailClassScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const classId = params.classId as string;
  const className = params.className as string || "Detail Kelas";

  const [activeTab, setActiveTab] = useState<'materi' | 'pengumuman' | 'siswa'>('materi');

  const [materials, setMaterials] = useState<Material[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingTab, setLoadingTab] = useState(false);

  useEffect(() => {
    loadMateri();
  }, [classId]);

  const loadMateri = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE_URL}/materials/class/${classId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(response.data);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnnouncements = async () => {
    try {
      setLoadingTab(true);
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE_URL}/classes/${classId}/announcements/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoadingTab(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoadingTab(true);
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE_URL}/classes/${classId}/students/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoadingTab(false);
    }
  };

  const handleTabChange = (tab: 'materi' | 'pengumuman' | 'siswa') => {
    setActiveTab(tab);
    if (tab === 'pengumuman' && announcements.length === 0) {
      loadAnnouncements();
    } else if (tab === 'siswa' && students.length === 0) {
      loadStudents();
    }
  };

  const renderMaterialItem = ({ item }: { item: Material }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({
        pathname: "/(tabs)/students/classes/DetailClass/MaterialDetail",
        params: { materialId: item.id, title: item.title }
      })}
    >
      <View style={styles.cardContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDate}>
            {new Date(item.created_at).toLocaleDateString('id-ID', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </Text>
        </View>
        {item.is_completed && (
          <Ionicons name="checkmark-circle" size={24} color="#4ADE80" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderAnnouncementItem = ({ item }: { item: Announcement }) => (
    <View style={styles.announcementCard}>
      <View style={styles.announcementHeader}>
        <Ionicons name="megaphone-outline" size={20} color="#FF9800" />
        <Text style={styles.announcementDate}>
          {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
        </Text>
      </View>
      <Text style={styles.announcementContent}>{item.content}</Text>
    </View>
  );

  const renderStudentItem = ({ item }: { item: Student }) => (
    <View style={styles.studentCard}>
      <Image
        source={{ uri: item.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" }}
        style={styles.studentAvatar}
      />
      <View>
        <Text style={styles.studentName}>{item.full_name}</Text>
        <Text style={styles.studentEmail}>{item.email}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B409C" />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonTouchable}>
          <View style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {className}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'materi' && styles.activeTab]}
          onPress={() => handleTabChange('materi')}
        >
          <Text style={[styles.tabText, activeTab === 'materi' && styles.activeTabText]}>Materi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'pengumuman' && styles.activeTab]}
          onPress={() => handleTabChange('pengumuman')}
        >
          <Text style={[styles.tabText, activeTab === 'pengumuman' && styles.activeTabText]}>Pengumuman</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'siswa' && styles.activeTab]}
          onPress={() => handleTabChange('siswa')}
        >
          <Text style={[styles.tabText, activeTab === 'siswa' && styles.activeTabText]}>Siswa</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {loading || loadingTab ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#0B409C" />
          </View>
        ) : (
          <>
            {activeTab === 'materi' && (
              materials.length > 0 ? (
                <FlatList
                  data={materials}
                  renderItem={renderMaterialItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.listPadding}
                />
              ) : (
                <View style={styles.centerState}>
                  <Ionicons name="folder-open-outline" size={50} color="#ccc" />
                  <Text style={styles.emptyText}>Belum ada materi.</Text>
                </View>
              )
            )}

            {activeTab === 'pengumuman' && (
              announcements.length > 0 ? (
                <FlatList
                  data={announcements}
                  renderItem={renderAnnouncementItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.listPadding}
                />
              ) : (
                <View style={styles.centerState}>
                  <Ionicons name="notifications-off-outline" size={50} color="#ccc" />
                  <Text style={styles.emptyText}>Belum ada pengumuman.</Text>
                </View>
              )
            )}

            {activeTab === 'siswa' && (
              <View>
                <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 5 }}>
                  <Text style={{ color: '#666', fontWeight: '600' }}>Total Siswa: {students.length}</Text>
                </View>
                <FlatList
                  data={students}
                  renderItem={renderStudentItem}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={styles.listPadding}
                />
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    backgroundColor: '#0B409C',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
  },
  backButtonTouchable: { marginRight: 15 },
  backButton: {
    padding: 5,
    borderRadius: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  contentContainer: { flex: 1, backgroundColor: '#F5F6FA' },
  listPadding: { padding: 20, paddingBottom: 100 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#888', marginTop: 10, fontSize: 14 },

  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0B409C',
  },
  tabText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#0B409C',
  },

  // Card Styles
  card: {
    backgroundColor: '#0B409C',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDate: { color: '#DBEAFE', fontSize: 12 },

  // Announcement Styles
  announcementCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  announcementDate: { fontSize: 12, color: '#888' },
  announcementContent: { fontSize: 14, color: '#333', lineHeight: 20 },

  // Student Styles
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  studentAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#eee' },
  studentName: { fontSize: 14, fontWeight: '600', color: '#333' },
  studentEmail: { fontSize: 12, color: '#888' },
});