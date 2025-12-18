import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getQuizDetail, submitQuiz } from '@/services/quizzes';

const COLORS = {
    primary: "#0B409C",
    bg: "#F5F6FA",
    success: "#388E3C",
    text: "#333",
    white: "#fff"
};

export default function QuizAttemptScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<any>({}); // Format: { questionId: "optionValue" }
    const [submitting, setSubmitting] = useState(false);

    // Timer state (simple implementation)
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        loadQuiz();

        // Disable Back Button to prevent accidental exit
        const backAction = () => {
            Alert.alert("Peringatan", "Apakah Anda yakin ingin keluar? Jawaban Anda tidak akan tersimpan.", [
                { text: "Batal", onPress: () => null, style: "cancel" },
                { text: "Keluar", onPress: () => router.back() }
            ]);
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timeLeft > 0 && !submitting) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && quiz && !submitting) {
            // Auto submit when time is up
            // handleFinish();
        }
        return () => clearInterval(interval);
    }, [timeLeft, submitting, quiz]);

    const loadQuiz = async () => {
        try {
            setLoading(true);
            const data = await getQuizDetail(id as string);
            setQuiz(data);
            setTimeLeft(data.duration_minutes * 60);
        } catch (error) {
            Alert.alert("Error", "Gagal memuat soal kuis.");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAnswer = (qId: string, value: string) => {
        setAnswers({ ...answers, [qId]: value });
    };

    const handleFinish = () => {
        // Validate if all questions answered? Optional.
        // Let's ask confirmation
        Alert.alert("Konfirmasi", "Apakah Anda yakin ingin mengumpulkan jawaban?", [
            { text: "Periksa Lagi", style: "cancel" },
            { text: "Ya, Kumpulkan", onPress: submitAnswers }
        ]);
    };

    const submitAnswers = async () => {
        try {
            setSubmitting(true);
            // Format payload
            const formattedAnswers = Object.keys(answers).map(qId => ({
                question_id: qId,
                answer_text: answers[qId]
            }));

            const result = await submitQuiz(id as string, formattedAnswers);

            Alert.alert("Selesai", `Skor Anda: ${result.score}`, [
                { text: "OK", onPress: () => router.replace('/(tabs)/students/quizzes') }
            ]);
        } catch (error) {
            Alert.alert("Error", "Gagal mengirim jawaban.");
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <LinearGradient colors={["#005DFF", "#0B409C"]} style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>{quiz.title}</Text>
                    <Text style={styles.headerSubtitle}>{quiz.class_name}</Text>
                </View>
                <View style={styles.timerBadge}>
                    <Ionicons name="time" size={16} color={COLORS.primary} />
                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                {quiz.questions.map((q: any, index: number) => (
                    <View key={q.id} style={styles.questionCard}>
                        <View style={styles.qHeader}>
                            <Text style={styles.qNumber}>Soal {index + 1}</Text>
                            <Text style={styles.qPoints}>{q.points} Poin</Text>
                        </View>
                        <Text style={styles.qText}>{q.text}</Text>

                        <View style={styles.optionsContainer}>
                            {q.options.map((opt: string, i: number) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        styles.optionButton,
                                        answers[q.id] === opt && styles.optionSelected
                                    ]}
                                    onPress={() => handleSelectAnswer(q.id, opt)}
                                >
                                    <View style={[
                                        styles.radio,
                                        answers[q.id] === opt && styles.radioSelected
                                    ]}>
                                        {answers[q.id] === opt && <View style={styles.radioInner} />}
                                    </View>
                                    <Text style={[
                                        styles.optionText,
                                        answers[q.id] === opt && styles.optionTextSelected
                                    ]}>{opt}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleFinish}
                    disabled={submitting}
                >
                    {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Kumpulkan Jawaban</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", maxWidth: 220 },
    headerSubtitle: { color: "#E0E0E0", fontSize: 12 },
    timerBadge: {
        backgroundColor: "#fff",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    timerText: { color: COLORS.primary, fontWeight: "bold", fontSize: 14 },

    content: { padding: 20, paddingBottom: 100 },

    questionCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        elevation: 2
    },
    qHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    qNumber: { color: COLORS.primary, fontWeight: "bold" },
    qPoints: { color: "#666", fontSize: 12 },
    qText: { fontSize: 15, color: COLORS.text, marginBottom: 15, lineHeight: 22 },

    optionsContainer: { gap: 10 },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        backgroundColor: "#FAFAFA"
    },
    optionSelected: {
        borderColor: COLORS.primary,
        backgroundColor: "#E3F2FD"
    },
    radio: {
        width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#ccc",
        justifyContent: 'center', alignItems: 'center', marginRight: 10
    },
    radioSelected: { borderColor: COLORS.primary },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
    optionText: { fontSize: 14, color: "#333", flex: 1 },
    optionTextSelected: { color: COLORS.primary, fontWeight: "bold" },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: "#fff", padding: 20, borderTopWidth: 1, borderTopColor: "#eee"
    },
    submitButton: {
        backgroundColor: COLORS.success,
        padding: 15,
        borderRadius: 12,
        alignItems: "center"
    },
    submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});
