import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import API_BASE_URL from '@/config/api';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

import QuizGameScreen, { ResultData } from './HalamanQuizz/index';

interface User {
  id: string;
  name: string;
}

// Interface Quiz disesuaikan dengan kebutuhan UI
interface QuizData {
  exam_id: string;
  exam_title: string;          // Mapping dari DB: title
  rules: string;               // Mapping dari DB: description
  duration_minutes: number;    // Sama dengan DB
  total_questions_to_display: number; // Mapping dari DB: total_questions
  deadline: string;            // Sama dengan DB
  invite_code: string;         // Mapping dari DB (logic kelas)
}

interface HistoryItem {
  userId: string;
  examId: string;
  attempt: number;
  score: string;
  date: string;
  time: string;
}

const USERS: User[] = [
  { id: 'user_01', name: 'Andi (Siswa)' },
  { id: 'user_02', name: 'Budi (Siswa)' }
];

// Helper shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  let newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function ListQuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const currentClassCode = (params.classCode as string) || 'CODING-A1';
  const currentSubjectName = (params.className as string) || 'Mata Pelajaran';

  const [screen, setScreen] = useState<ScreenMode>('loading');
  const [activeUser, setActiveUser] = useState<User>(USERS[0]);

  const [quizzesList, setQuizzesList] = useState<QuizData[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizData | null>(null);
  const [preparedQuestions, setPreparedQuestions] = useState<any[]>([]);

  const [globalHistory, setGlobalHistory] = useState<HistoryItem[]>([
    { userId: 'user_01', examId: 'CODE_PY1', attempt: 1, score: "4 / 5", date: "20 Juni 2025", time: "05:30" }
  ]);

  // --- 2. FETCH DATA DARI API ---
  useEffect(() => {
    fetchQuizzesFromAPI();
  }, [currentClassCode]);

  const fetchQuizzesFromAPI = async () => {
    try {
      setScreen('loading');

      // Asumsi endpoint backend Anda untuk mengambil quiz berdasarkan kode kelas
      // Sesuaikan endpoint '/quizzes/' ini dengan route di Django/Backend Anda
      const response = await axios.get(`${API_BASE_URL}/quizzes/`, {
        params: { class_code: currentClassCode } // Mengirim filter kode kelas
      });

      // Mapping data dari format Database (Snake Case) ke format UI Aplikasi
      // Lihat gambar database Anda: title, description, total_questions, dll.
      // Handle pagination (results array) or direct array
      const rawData = Array.isArray(response.data) ? response.data : (response.data.results || []);

      const formattedData: QuizData[] = rawData.map((item: any) => ({
        exam_id: item.exam_id,
        exam_title: item.title,               // Kolom DB: title
        rules: item.description || "Kerjakan dengan jujur.", // Kolom DB: description
        duration_minutes: item.duration_minutes,
        total_questions_to_display: item.total_questions,    // Kolom DB: total_questions
        deadline: item.deadline,
        invite_code: currentClassCode // Asumsi ini milik kelas yang sedang dibuka
      }));

      setQuizzesList(formattedData);
      setScreen('home');

    } catch (error) {
      console.error("Error fetching quizzes:", error);
      Alert.alert("Gagal", "Tidak dapat mengambil data kuis dari server.");
      // Fallback ke array kosong atau handle error
      setQuizzesList([]);
      setScreen('home');
    }
  };

  const handleSwitchUser = () => {
    const newUser = activeUser.id === 'user_01' ? USERS[1] : USERS[0];
    Alert.alert("Ganti Akun", `Login sebagai: ${newUser.name}`, [{ text: "Lanjut", onPress: () => setActiveUser(newUser) }]);
  };

  const handleSelectQuiz = (quiz: QuizData) => {
    setSelectedQuiz(quiz);
    setScreen('intro');
  };

  const handleStartQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      // --- 3. FETCH SOAL (QUESTIONS) DARI API ---
      // Saat tombol mulai ditekan, kita ambil soal real dari database
      // Asumsi endpoint: /quizzes/<exam_id>/questions/

      // Tampilkan loading sebentar jika perlu, atau langsung await
      const response = await axios.get(`${API_BASE_URL}/quizzes/${selectedQuiz.exam_id}/questions/`);
      const rawQuestions = response.data;

      if (!rawQuestions || rawQuestions.length === 0) {
        Alert.alert("Maaf", "Soal belum tersedia di database.");
        return;
      }

      // Logic acak soal
      const limit = selectedQuiz.total_questions_to_display;
      // Pastikan struktur data soal dari API disesuaikan jika perlu
      const shuffledQuestions = shuffleArray(rawQuestions).slice(0, limit);

      // Asumsi soal dari API punya field 'options' berbentuk array
      const finalQuestions = shuffledQuestions.map((q: any) => ({
        ...q,
        options: shuffleArray(q.options)
      }));

      setPreparedQuestions(finalQuestions);
      setScreen('quiz');

    } catch (error) {
      console.error("Error fetching questions:", error);
      Alert.alert("Error", "Gagal mengunduh soal. Periksa koneksi internet.");
    }
  };

  const handleQuizFinishAndExit = (resultData: ResultData) => {
    if (!selectedQuiz) return;

    const now = new Date();
    const currentDate = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const existingAttempts = globalHistory.filter(item =>
      item.userId === activeUser.id &&
      item.examId === selectedQuiz.exam_id
    );

    const newHistoryItem: HistoryItem = {
      userId: activeUser.id,
      examId: selectedQuiz.exam_id,
      attempt: existingAttempts.length + 1,
      score: `${resultData.correct} / ${resultData.total}`,
      date: currentDate,
      time: resultData.timeTaken
    };

    setGlobalHistory([...globalHistory, newHistoryItem]);

    // Opsional: Kirim nilai ke database di sini via axios.post()
    // axios.post(`${API_BASE_URL}/grades/submit`, { ... })

    setScreen('intro');
  };

  const myHistory = globalHistory.filter(item =>
    item.userId === activeUser.id &&
    selectedQuiz && item.examId === selectedQuiz.exam_id
  );

  if (screen === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F6F8' }}>
        <ActivityIndicator size="large" color="#0056b3" />
        <Text style={{ marginTop: 10, color: '#666' }}>Memuat Data Ujian...</Text>
      </View>
    );
  }

  // === SCREEN 1: HOME (List Quiz) ===
  if (screen === 'home') {
    const renderQuizItem: ListRenderItem<QuizData> = ({ item }) => (
      <TouchableOpacity
        style={styles.quizCard}
        onPress={() => handleSelectQuiz(item)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#ffffff', '#f8faff']}
          style={styles.quizCardGradient}
        >
          <View style={styles.quizCardLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#e3f2fd' }]}>
              <Ionicons name="school" size={24} color="#0056b3" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.exam_title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.rules}</Text>

              <View style={styles.badgeRow}>
                <View style={styles.badgeContainer}>
                  <Ionicons name="time-outline" size={12} color="#0056b3" />
                  <Text style={styles.badgeText}>{item.duration_minutes} min</Text>
                </View>
                <View style={[styles.badgeContainer, { marginLeft: 8 }]}>
                  <Ionicons name="help-circle-outline" size={12} color="#0056b3" />
                  <Text style={styles.badgeText}>{item.total_questions_to_display} Soal</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.quizCardRight}>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#0056b3" barStyle="light-content" />
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15, padding: 4 }}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {currentSubjectName}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Text style={{ color: '#E0E0E0', fontSize: 12 }}>Kode Kelas: </Text>
                <Text style={styles.classCodeSmall}>{currentClassCode}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={handleSwitchUser} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="person-circle" size={36} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={quizzesList}
          keyExtractor={(item) => item.exam_id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={() => (
            <Text style={{ marginBottom: 15, color: '#555', fontWeight: 'bold' }}>
              Tersedia {quizzesList.length} Sesi Ujian:
            </Text>
          )}
          ListEmptyComponent={() => (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#777' }}>Tidak ada ujian untuk kode kelas ini.</Text>
            </View>
          )}
          renderItem={renderQuizItem}
        />
      </SafeAreaView>
    );
  }

  // === SCREEN 2: INTRO ===
  if (screen === 'intro' && selectedQuiz) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#0056b3" barStyle="light-content" />
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity onPress={() => setScreen('home')} style={{ marginRight: 15 }}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {selectedQuiz.exam_title}
              </Text>
              <Text style={{ color: '#E0E0E0', fontSize: 13, marginTop: 2 }}>
                {currentSubjectName}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={styles.card}>
            <Text style={styles.descText}>{selectedQuiz.rules}</Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>📝 Jumlah Soal: {selectedQuiz.total_questions_to_display}</Text>
              <Text style={styles.infoText}>⏱ Durasi: {selectedQuiz.duration_minutes} Menit</Text>
              <Text style={styles.infoText}>📅 Batas: {selectedQuiz.deadline}</Text>
            </View>

            <Text style={styles.noteText}>Riwayat Pengerjaan ({activeUser.name}):</Text>

            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 0.6 }]}>Ke-</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Score</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Waktu</Text>
                <Text style={[styles.th, { flex: 1.4, textAlign: 'right' }]}>Tanggal</Text>
              </View>

              {myHistory.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#aaa', fontStyle: 'italic' }}>Belum ada data pengerjaan.</Text>
                </View>
              ) : (
                myHistory.map((item, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={[styles.td, { flex: 0.6 }]}>{item.attempt}</Text>
                    <Text style={[styles.td, { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#0056b3' }]}>{item.score}</Text>
                    <Text style={[styles.td, { flex: 1, textAlign: 'center' }]}>{item.time}</Text>
                    <Text style={[styles.td, { flex: 1.4, textAlign: 'right', fontSize: 10 }]}>{item.date}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.btnStart} onPress={handleStartQuiz}>
            <Text style={styles.btnStartText}>Mulai Quizz</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // === SCREEN 3: QUIZ GAME ===
  if (screen === 'quiz' && selectedQuiz) {
    return (
      <QuizGameScreen
        questions={preparedQuestions}
        metaData={selectedQuiz}
        onExit={handleQuizFinishAndExit}
      />
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  header: {
    backgroundColor: '#0056b3',
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    elevation: 4
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  classCodeSmall: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1
  },
  quizCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: 'white' // Fallback
  },
  quizCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  quizCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizCardRight: {
    marginLeft: 10,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4
  },
  cardDesc: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
    lineHeight: 16
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  badgeText: { fontSize: 10, color: '#0056b3', marginLeft: 4, fontWeight: '600' },

  card: { backgroundColor: 'white', borderRadius: 12, padding: 20, elevation: 3, marginBottom: 20 },
  descText: { fontSize: 13, color: '#444', textAlign: 'justify', lineHeight: 20 },
  infoBox: { marginTop: 15, marginBottom: 15, padding: 10, backgroundColor: '#F8F9FA', borderRadius: 8 },
  infoText: { fontSize: 13, color: '#333', marginBottom: 4 },
  noteText: { fontSize: 14, color: '#333', fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  tableContainer: { borderWidth: 1, borderColor: '#EEE', borderRadius: 8, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#E9ECEF', padding: 10, borderBottomWidth: 1, borderColor: '#EEE' },
  tableRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderColor: '#EEE', backgroundColor: 'white' },
  th: { fontSize: 11, fontWeight: 'bold', color: '#555' },
  td: { fontSize: 11, color: '#333' },
  footerContainer: { padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#EEE' },
  btnStart: { backgroundColor: '#0056b3', paddingVertical: 15, borderRadius: 8, alignItems: 'center', elevation: 2 },
  btnStartText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});