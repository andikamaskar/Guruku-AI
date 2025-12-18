import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { fetchStudentQuizzes } from '@/services/quizzes';
import { LinearGradient } from 'expo-linear-gradient';

interface QuizData {
  id: string;
  title: string;
  description: string;
  class_name: string;
  duration_minutes: number;
  deadline: string;
  total_questions: number;
  is_active: boolean;
}

const COLORS = {
  primary: "#0B409C",
  accent: "#FFD700",
  textLight: "#F5F6FA",
  textDark: "#333",
  bg: "#F5F6FA"
};

export default function ListQuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { classCode, className } = params;

  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await fetchStudentQuizzes();
      let filtered = data;
      if (className) {
        filtered = data.filter((q: any) => q.class_name === className);
      }
      setQuizzes(filtered);
    } catch (error) {
      //   Alert.alert("Error", "Gagal memuat kuis.");
      console.log("Error fetching quizzes", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadQuizzes();
    }, [])
  );

  const handleStartQuiz = (quizId: string) => {
    router.push(`/(tabs)/students/quizzes/${quizId}/attempt`);
  };

  const renderQuizItem: ListRenderItem<QuizData> = ({ item }) => {
    // Calculate if overdue
    const isOverdue = item.deadline ? new Date(item.deadline) < new Date() : false;

    return (
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={['#fff', '#fefefe']}
          style={styles.card}
        >
          <View style={styles.cardAccent} />

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.quizTitle}>{item.title}</Text>
                <Text style={styles.classLabel}>{item.class_name}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: isOverdue ? '#FFEBEE' : '#E3F2FD' }]}>
                <Text style={[styles.statusText, { color: isOverdue ? '#D32F2F' : '#1565C0' }]}>
                  {isOverdue ? 'Berakhir' : 'Tersedia'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={18} color="#0B409C" />
                <Text style={styles.detailText}>{item.duration_minutes} Menit</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="document-text-outline" size={18} color="#0B409C" />
                <Text style={styles.detailText}>{item.total_questions || '?'} Soal</Text>
              </View>
            </View>

            {item.deadline && (
              <View style={[styles.deadlineBox, isOverdue && styles.overdueBox]}>
                <Ionicons name="calendar-outline" size={16} color={isOverdue ? '#D32F2F' : '#666'} />
                <Text style={[styles.deadlineText, isOverdue && { color: '#D32F2F' }]}>
                  {new Date(item.deadline).toLocaleString('id-ID', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.actionButton, isOverdue && styles.disabledButton]}
              onPress={() => !isOverdue && handleStartQuiz(item.id)}
              disabled={isOverdue}
            >
              <LinearGradient
                colors={isOverdue ? ['#ccc', '#bbb'] : ['#0B409C', '#005DFF']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                <Text style={styles.actionButtonText}>
                  {isOverdue ? "Waktu Habis" : "Mulai Kerjakan"}
                </Text>
                {!isOverdue && <Ionicons name="arrow-forward" size={16} color="white" />}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B409C" />

      {/* Header Background */}
      <View style={styles.headerBgContainer}>
        <LinearGradient colors={['#0B409C', '#1976D2']} style={styles.headerBg} />
        <View style={styles.headerCurve} />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daftar Kuis</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {className && (
            <View style={styles.filterContainer}>
              <Text style={styles.filterText}>Filtering: {className}</Text>
              <TouchableOpacity onPress={() => router.setParams({ className: '' })}>
                <Ionicons name="close-circle" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#0B409C" />
              <Text style={styles.loadingText}>Memuat kuis...</Text>
            </View>
          ) : (
            <FlatList
              data={quizzes}
              keyExtractor={(item) => item.id}
              renderItem={renderQuizItem}
              contentContainerStyle={{ paddingBottom: 30, paddingTop: 10 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <Ionicons name="library-outline" size={60} color="#ccc" />
                  <Text style={styles.emptyText}>Belum ada kuis tersedia.</Text>
                </View>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },

  // Header Styles
  headerBgContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 180,
    zIndex: -1
  },
  headerBg: { flex: 1 },
  headerCurve: {
    backgroundColor: '#F5F6FA',
    height: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 60
  },
  backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },

  content: { flex: 1, paddingHorizontal: 20 },

  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0B409C',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15
  },
  filterText: { color: 'white', fontWeight: 'bold' },

  // Card Styles
  cardContainer: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#0B409C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white'
  },
  cardAccent: {
    height: 4,
    backgroundColor: '#FFD700'
  },
  cardContent: {
    padding: 20
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  classLabel: {
    fontSize: 14, color: '#0B409C', fontWeight: '600'
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: { fontSize: 10, fontWeight: 'bold' },

  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 15 },

  detailsGrid: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 20
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  detailText: { fontSize: 13, color: '#555', fontWeight: '500' },

  deadlineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8
  },
  overdueBox: { backgroundColor: '#FFEBEE' },
  deadlineText: { fontSize: 12, color: '#666', fontWeight: '500' },

  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2
  },
  disabledButton: { elevation: 0 },
  btnGradient: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#999', marginTop: 10, fontSize: 16 }
});