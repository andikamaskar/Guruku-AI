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

// --- IMPORT DARI FOLDER LAIN ---
import { 
  AVAILABLE_QUIZZES, 
  QUESTIONS_BANK, 
  QuizData, 
  Question 
} from './DummyDatabase'; 

import QuizGameScreen, { ResultData } from './HalamanQuizz';

// --- TIPE DATA LOCAL ---
type ScreenMode = 'loading' | 'home' | 'intro' | 'quiz';

interface User {
  id: string;
  name: string;
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
  const [preparedQuestions, setPreparedQuestions] = useState<Question[]>([]); 

  const [globalHistory, setGlobalHistory] = useState<HistoryItem[]>([
    { userId: 'user_01', examId: 'CODE_PY1', attempt: 1, score: "4 / 5", date: "20 Juni 2025", time: "05:30" }
  ]);

  useEffect(() => {
    setTimeout(() => {
      const allQuizzes = AVAILABLE_QUIZZES;
      const classQuizzes = allQuizzes.filter(
        quiz => quiz.invite_code === currentClassCode
      );
      setQuizzesList(classQuizzes);
      setScreen('home');
    }, 800);
  }, [currentClassCode]);

  const handleSwitchUser = () => {
    const newUser = activeUser.id === 'user_01' ? USERS[1] : USERS[0];
    Alert.alert("Ganti Akun", `Login sebagai: ${newUser.name}`, [{ text: "Lanjut", onPress: () => setActiveUser(newUser) }]);
  };

  const handleSelectQuiz = (quiz: QuizData) => {
    setSelectedQuiz(quiz);
    setScreen('intro');
  };

  const handleStartQuiz = () => {
    if (!selectedQuiz) return;
    
    const bank = QUESTIONS_BANK;
    const rawQuestions = bank[selectedQuiz.exam_id]; 
    
    if (!rawQuestions) {
      Alert.alert("Maaf", "Soal belum tersedia.");
      return;
    }

    const limit = selectedQuiz.total_questions_to_display;
    const shuffledQuestions = shuffleArray(rawQuestions).slice(0, limit);
    const finalQuestions = shuffledQuestions.map(q => ({ 
      ...q, 
      options: shuffleArray(q.options) 
    }));

    setPreparedQuestions(finalQuestions);
    setScreen('quiz');
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
    setScreen('intro');
  };

  const myHistory = globalHistory.filter(item => 
    item.userId === activeUser.id && 
    selectedQuiz && item.examId === selectedQuiz.exam_id
  );

  if (screen === 'loading') {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor: '#F4F6F8'}}>
        <ActivityIndicator size="large" color="#0056b3"/>
      </View>
    );
  }

  // === SCREEN 1: HOME (List Quiz) ===
  if (screen === 'home') {
    const renderQuizItem: ListRenderItem<QuizData> = ({item}) => (
      <TouchableOpacity style={styles.quizCard} onPress={() => handleSelectQuiz(item)}>
        <View style={{flex:1}}>
          <Text style={styles.cardTitle}>{item.exam_title}</Text>
          <Text style={{color:'#666', fontSize: 12, marginTop: 4}} numberOfLines={1}>{item.rules}</Text>
          <View style={{flexDirection:'row', gap:10, marginTop:8}}>
            <View style={styles.badgeContainer}>
                <Ionicons name="time-outline" size={12} color="#0056b3" />
                <Text style={styles.badgeText}>{item.duration_minutes} mnt</Text>
            </View>
            <View style={styles.badgeContainer}>
                <Ionicons name="document-text-outline" size={12} color="#0056b3" />
                <Text style={styles.badgeText}>{item.total_questions_to_display} Soal</Text>
            </View>
          </View>
        </View>
        <View style={{justifyContent:'center', alignItems:'center'}}>
            <View style={{backgroundColor:'#E3F2FD', padding:8, borderRadius:20}}>
              <Ionicons name="play" size={20} color="#0056b3" />
            </View>
        </View>
      </TouchableOpacity>
    );

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#0056b3" barStyle="light-content" />
        <View style={styles.header}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
                {/* 1. TOMBOL BACK */}
                <TouchableOpacity onPress={() => router.back()} style={{marginRight: 15, padding: 4}}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                {/* 2. HEADER TEXT (POSISI DITUKAR) */}
                <View>
                    {/* Nama Mapel di ATAS (Judul Utama) */}
                    <Text style={styles.headerTitle} numberOfLines={1}>
                      {currentSubjectName}
                    </Text>

                    {/* Kode Kelas di BAWAH (Subtitle) */}
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 2}}>
                      <Text style={{color:'#E0E0E0', fontSize: 12}}>Kode Kelas: </Text>
                      <Text style={styles.classCodeSmall}>{currentClassCode}</Text>
                    </View>
                </View>
            </View>
            
            <TouchableOpacity onPress={handleSwitchUser} style={{flexDirection:'row', alignItems:'center'}}>
              <Ionicons name="person-circle" size={36} color="white" />
            </TouchableOpacity>
        </View>

        <FlatList
          data={quizzesList}
          keyExtractor={(item) => item.exam_id}
          contentContainerStyle={{padding: 16}}
          ListHeaderComponent={() => (
            <Text style={{marginBottom:15, color:'#555', fontWeight:'bold'}}>
              Tersedia {quizzesList.length} Sesi Ujian:
            </Text>
          )}
          ListEmptyComponent={() => (
            <View style={{padding:20, alignItems:'center'}}>
               <Text style={{color:'#777'}}>Tidak ada ujian untuk kode kelas ini.</Text>
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
          <View style={{flexDirection:'row', alignItems:'center', flex: 1}}>
             {/* Tombol Back */}
             <TouchableOpacity onPress={() => setScreen('home')} style={{marginRight: 15}}>
               <Ionicons name="arrow-back" size={24} color="white" />
             </TouchableOpacity>

             {/* INFO HEADER */}
             <View style={{flex: 1}}>
                {/* 1. Nama Sesi (Judul Utama) */}
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {selectedQuiz.exam_title}
                </Text>
                
                {/* 2. Nama Mata Pelajaran (KONSISTEN DENGAN LIST QUIZ) */}
                <Text style={{color:'#E0E0E0', fontSize: 13, marginTop: 2}}>
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
                  <Text style={[styles.th, {flex:0.6}]}>Ke-</Text>
                  <Text style={[styles.th, {flex:1, textAlign:'center'}]}>Score</Text>
                  <Text style={[styles.th, {flex:1, textAlign:'center'}]}>Waktu</Text>
                  <Text style={[styles.th, {flex:1.4, textAlign:'right'}]}>Tanggal</Text>
               </View>
               
               {myHistory.length === 0 ? (
                 <View style={{padding:20, alignItems:'center'}}>
                   <Text style={{color:'#aaa', fontStyle:'italic'}}>Belum ada data pengerjaan.</Text>
                 </View>
               ) : (
                 myHistory.map((item, idx) => (
                    <View key={idx} style={styles.tableRow}>
                       <Text style={[styles.td, {flex:0.6}]}>{item.attempt}</Text>
                       <Text style={[styles.td, {flex:1, textAlign:'center', fontWeight:'bold', color:'#0056b3'}]}>{item.score}</Text>
                       <Text style={[styles.td, {flex:1, textAlign:'center'}]}>{item.time}</Text>
                       <Text style={[styles.td, {flex:1.4, textAlign:'right', fontSize:10}]}>{item.date}</Text>
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
    elevation:4 
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: '#E0E0E0', fontSize: 12 },
  
  // Style Baru untuk Kode Kelas yang lebih kecil dan proporsional di bawah judul
  classCodeSmall: { 
    color: '#FFD700', // Warna Emas agar terlihat jelas
    fontSize: 14, 
    fontWeight: 'bold', 
    fontFamily: 'monospace', 
    letterSpacing: 1 
  },

  quizCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, flexDirection: 'row', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  badgeContainer: { flexDirection:'row', alignItems:'center', backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, color: '#0056b3', marginLeft: 4, fontWeight: '600' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 20, elevation: 3, marginBottom: 20 },
  descText: { fontSize: 13, color: '#444', textAlign: 'justify', lineHeight: 20 },
  infoBox: { marginTop: 15, marginBottom: 15, padding: 10, backgroundColor: '#F8F9FA', borderRadius: 8 },
  infoText: { fontSize: 13, color: '#333', marginBottom: 4 },
  noteText: { fontSize: 14, color: '#333', fontWeight:'bold', marginBottom: 10, marginTop:10 },
  tableContainer: { borderWidth: 1, borderColor: '#EEE', borderRadius: 8, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#E9ECEF', padding: 10, borderBottomWidth: 1, borderColor: '#EEE' },
  tableRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderColor: '#EEE', backgroundColor: 'white' },
  th: { fontSize: 11, fontWeight: 'bold', color: '#555' },
  td: { fontSize: 11, color: '#333' },
  footerContainer: { padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#EEE' },
  btnStart: { backgroundColor: '#0056b3', paddingVertical: 15, borderRadius: 8, alignItems: 'center', elevation: 2 },
  btnStartText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});