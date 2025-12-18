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
  ListRenderItem
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { fetchStudentQuizzes } from '@/services/quizzes';

interface QuizData {
  id: string;
  title: string;
  description: string;
  class_name: string;
  duration_minutes: number;
  deadline: string;
  total_questions: number; // API returns this
}

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

      // Filter by class name if provided, otherwise show all or filter by other means
      // The API returns 'class_name'. Check similarity.
      let filtered = data;
      if (className) {
        filtered = data.filter((q: any) => q.class_name === className);
      }
      setQuizzes(filtered);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal memuat kuis.");
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
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.quizTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: "#E3F2FD" }]}>
            <Text style={[styles.statusText, { color: "#1565C0" }]}>Available</Text>
          </View>
        </View>

        <Text style={styles.classLabel}>{item.class_name}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.duration_minutes} Menit</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="document-text-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.total_questions || '?'} Soal</Text>
          </View>
        </View>

        {item.deadline && (
          <View style={styles.deadlineRow}>
            <Ionicons name="calendar-outline" size={16} color="#D32F2F" />
            <Text style={styles.deadlineText}>
              Deadline: {new Date(item.deadline).toLocaleString()}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleStartQuiz(item.id)}
        >
          <Text style={styles.actionButtonText}>Mulai Kerjakan</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0B409C" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daftar Kuis</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {className && (
          <Text style={styles.subHeader}>
            Kelas: {className}
          </Text>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#0B409C" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={quizzes}
            keyExtractor={(item) => item.id}
            renderItem={renderQuizItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Tidak ada kuis tersedia.</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  header: {
    backgroundColor: '#0B409C',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4
  },
  backButton: { padding: 4 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  subHeader: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },

  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10
  },
  classLabel: {
    fontSize: 12, color: '#0B409C', fontWeight: 'bold', marginBottom: 12
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontSize: 10, fontWeight: 'bold' },

  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  infoText: { fontSize: 12, color: '#666' },

  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 6
  },
  deadlineText: { fontSize: 12, color: '#D32F2F', fontWeight: '500' },

  actionButton: {
    backgroundColor: '#0B409C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#999' }
});