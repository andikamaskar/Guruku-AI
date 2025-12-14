import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  SafeAreaView, 
  BackHandler 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import Tipe Data dari DummyDatabase
// "../DummyDatabase" artinya naik satu folder, lalu masuk DummyDatabase
import { Question, QuizData } from '../DummyDatabase';

// Definisi Tipe untuk Hasil Akhir
export interface ResultData {
  score: number;
  correct: number;
  answered: number;
  total: number;
  timeTaken: string;
}

interface QuizGameScreenProps {
  questions: Question[];
  metaData: QuizData;
  onExit: (result: ResultData) => void;
}

const QuizGameScreen: React.FC<QuizGameScreenProps> = ({ questions, metaData, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  
  const totalDuration = metaData.duration_minutes * 60;
  const [timeLeft, setTimeLeft] = useState<number>(totalDuration);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [scoreData, setScoreData] = useState<ResultData | null>(null);

  const formatTime = (seconds: number): string => {
    if (seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60).toString().padStart(2,'0');
    const sec = (seconds % 60).toString().padStart(2,'0');
    return `${m}:${sec}`;
  };

  const handleFinish = useCallback((auto: boolean = false) => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) correctCount++;
    });
    
    const timeSpentSeconds = totalDuration - timeLeft;
    const timeSpentFormatted = formatTime(timeSpentSeconds);

    const result: ResultData = {
      score: Math.round((correctCount / questions.length) * 100),
      correct: correctCount,
      answered: Object.keys(selectedAnswers).length,
      total: questions.length,
      timeTaken: timeSpentFormatted 
    };
    
    setScoreData(result);
    setIsFinished(true);
    
    if(auto) Alert.alert("Waktu Habis", "Jawaban disimpan otomatis.");
  }, [questions, selectedAnswers, timeLeft, totalDuration]); 

  useEffect(() => {
    if (isFinished) return;
    if (timeLeft <= 0) { handleFinish(true); return; }
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isFinished, handleFinish]);

  useEffect(() => {
    const backAction = () => {
      if (!isFinished) {
        Alert.alert("Keluar Quiz?", "Progres akan disimpan.", [
          { text: "Batal", style: "cancel" },
          { text: "Ya", onPress: () => handleFinish(false) }
        ]);
        return true;
      }
      return false; 
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [isFinished, handleFinish]);

  const handleSelectOption = (opt: string) => {
    setSelectedAnswers(p => ({ ...p, [currentIndex]: opt }));
  };
  
  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(p => p + 1);
    else Alert.alert("Selesai?", "Kumpulkan jawaban?", [{text: "Batal"}, {text: "Ya", onPress: () => handleFinish(false)}]);
  };
  
  const handlePrev = () => { 
    if (currentIndex > 0) setCurrentIndex(p => p - 1); 
  };

  if (isFinished && scoreData) {
    return (
      <SafeAreaView style={styles.container}>
         <View style={styles.headerResult}>
            <Text style={styles.headerTitle}>Hasil Quiz</Text>
         </View>
         <View style={styles.resultContainer}>
            <Text style={styles.scoreText}>Nilai: {scoreData.score}</Text>
            <View style={styles.resultDetailBox}>
              <Text style={styles.resultText}>Benar: {scoreData.correct} / {scoreData.total}</Text>
              <Text style={styles.resultText}>Waktu: {scoreData.timeTaken}</Text>
            </View>
            <TouchableOpacity style={styles.btnExit} onPress={() => onExit(scoreData)}>
               <Text style={styles.btnTextWhite}>Simpan & Kembali ke Menu</Text>
            </TouchableOpacity>
         </View>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => Alert.alert("Keluar?", "Yakin keluar?", [{text: "Batal"}, {text: "Ya", onPress: () => handleFinish(false)}])}>
            <Ionicons name="arrow-back" size={24} color="white" />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Soal {currentIndex + 1}/{questions.length}</Text>
         <View style={{width: 24}}/>
      </View>

      <ScrollView contentContainerStyle={{padding: 16, paddingBottom: 100}}>
        <View style={styles.gridContainer}>
           {questions.map((_, idx) => {
             const isActive = currentIndex === idx;
             const isAnswered = selectedAnswers[idx] !== undefined;
             return (
               <TouchableOpacity 
                  key={idx} 
                  onPress={() => setCurrentIndex(idx)}
                  style={[
                    styles.gridItem,                        
                    isAnswered && styles.gridItemAnswered,
                    isActive && styles.gridItemActive
                  ]}
               >
                  <Text style={[styles.gridText, (isAnswered || isActive) && styles.gridTextWhite]}>
                    {idx + 1}
                  </Text>
               </TouchableOpacity>
             );
           })}
        </View>

        <View style={styles.card}>
           <Text style={styles.questionNumber}>Soal #{currentIndex + 1}</Text>
           <Text style={styles.questionText}>{currentQ.question}</Text>
        </View>

        <View style={{gap: 12}}>
           {currentQ.options.map((opt, idx) => {
             const isSel = selectedAnswers[currentIndex] === opt;
             return (
               <TouchableOpacity key={idx} style={[styles.optionButton, isSel && styles.optionButtonSelected]} onPress={() => handleSelectOption(opt)}>
                  <View style={[styles.optionLabelBox, isSel && styles.optionLabelBoxSelected]}>
                    <Text style={[styles.optionLabelText, isSel && styles.optionLabelTextSelected]}>{["A","B","C","D"][idx]}</Text>
                  </View>
                  <Text style={[styles.optionText, isSel && styles.optionTextSelected]}>{opt}</Text>
               </TouchableOpacity>
             );
           })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
         <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0} style={{flexDirection:'row', alignItems:'center'}}>
            <Ionicons name="arrow-back" size={20} color={currentIndex===0?'#ccc':'#0056b3'}/>
            <Text style={{color: currentIndex===0?'#ccc':'#0056b3', fontWeight:'bold'}}> Pref</Text>
         </TouchableOpacity>
         <View style={styles.timerContainer}>
            <Text style={{fontWeight:'bold', color: '#333'}}>{formatTime(timeLeft)}</Text>
         </View>
         <TouchableOpacity onPress={handleNext} style={{flexDirection:'row', alignItems:'center'}}>
            <Text style={{color:'#0056b3', fontWeight:'bold'}}>{currentIndex===questions.length-1 ? "Selesai" : "Next"} </Text>
            <Ionicons name={currentIndex===questions.length-1?"checkmark-circle":"arrow-forward"} size={20} color="#0056b3"/>
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default QuizGameScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  header: { backgroundColor: '#0056b3', height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, elevation: 4 },
  headerResult: { backgroundColor: '#0056b3', height: 60, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, marginBottom: 20 },
  gridItem: { width: 28, height: 28, borderRadius: 4, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CCC', justifyContent: 'center', alignItems: 'center' },
  gridItemAnswered: { backgroundColor: '#9C27B0', borderWidth: 0 },
  gridItemActive: { backgroundColor: '#0056b3', borderWidth: 0 },
  gridText: { color: '#333', fontWeight: 'bold', fontSize: 12 },
  gridTextWhite: { color: 'white' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 20, elevation: 3 },
  questionNumber: { color: '#0056b3', fontWeight: 'bold', marginBottom: 12 },
  questionText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  optionButton: { flexDirection: 'row', backgroundColor: '#004494', borderRadius: 10, alignItems: 'center', padding: 4 },
  optionButtonSelected: { backgroundColor: '#0056b3', borderWidth: 2, borderColor: '#FFD700' },
  optionLabelBox: { backgroundColor: 'white', width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  optionLabelBoxSelected: { backgroundColor: '#FFD700' },
  optionLabelText: { fontWeight: 'bold', color: '#333' },
  optionLabelTextSelected: { color: '#0056b3' },
  optionText: { color: 'white', fontWeight: '600', flex: 1, paddingRight: 8 },
  optionTextSelected: { color: '#FFD700' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'white', position: 'absolute', bottom: 0, width: '100%', borderTopWidth: 1, borderColor: '#eee' },
  timerContainer: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  scoreText: { fontSize: 40, fontWeight: 'bold', color: '#0056b3', marginBottom: 10 },
  resultDetailBox: { backgroundColor: 'white', padding: 20, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 20 },
  resultText: { fontSize: 16, color: '#333', marginVertical: 4 },
  btnExit: { backgroundColor: '#0056b3', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
  btnTextWhite: { color: 'white', fontWeight: 'bold' }
});