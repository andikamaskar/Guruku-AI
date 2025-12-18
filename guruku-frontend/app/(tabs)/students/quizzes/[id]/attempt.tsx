import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, BackHandler, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getQuizDetail, submitQuiz } from '@/services/quizzes';

const COLORS = {
    primary: "#0B409C",
    accent: "#FFD700",
    bg: "#F5F6FA",
    success: "#388E3C",
    danger: "#D32F2F",
    text: "#333",
    white: "#fff",
    lightOverlay: 'rgba(255,255,255,0.2)'
};

export default function QuizAttemptScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // States
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState<any>(null);
    const [status, setStatus] = useState<'INTRO' | 'LOCKED' | 'ATTEMPT' | 'RESULT'>('INTRO');

    // Attempt Logic
    const [answers, setAnswers] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentScore, setCurrentScore] = useState(0);

    // Initial Load
    useEffect(() => {
        loadQuiz();
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'ATTEMPT' && timeLeft > 0 && !submitting) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && status === 'ATTEMPT' && !submitting) {
            // Auto submit when time is up
            handleSubmit(true);
        }
        return () => clearInterval(interval);
    }, [timeLeft, status, submitting]);

    // Back Handler to prevent accidental exit
    useEffect(() => {
        const backAction = () => {
            if (status === 'ATTEMPT') {
                Alert.alert("Peringatan", "Apakah Anda yakin ingin keluar? Jawaban Anda tidak akan tersimpan.", [
                    { text: "Batal", style: "cancel" },
                    { text: "Keluar", onPress: () => router.back() }
                ]);
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [status]);

    const loadQuiz = async () => {
        try {
            setLoading(true);
            const data = await getQuizDetail(id as string);
            setQuiz(data);
            // Check Max Attempts
            const maxAttempts = data.max_attempts || 1;
            const userAttempts = data.user_attempts_count || 0;

            if (userAttempts >= maxAttempts) {
                setStatus('LOCKED');
                setCurrentScore(data.latest_score || 0);
            } else {
                setStatus('INTRO');
            }

            setTimeLeft(data.duration_minutes * 60);
        } catch (error) {
            Alert.alert("Error", "Gagal memuat soal kuis.");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = () => {
        setStatus('ATTEMPT');
    };

    const handleSelectAnswer = (qId: string, value: string) => {
        setAnswers({ ...answers, [qId]: value });
    };

    const handleSubmit = async (auto = false) => {
        if (!auto) {
            // Manual check
            Alert.alert("Konfirmasi", "Apakah Anda yakin ingin mengumpulkan jawaban?", [
                { text: "Periksa Lagi", style: "cancel" },
                { text: "Ya, Kumpulkan", onPress: processSubmit }
            ]);
        } else {
            processSubmit();
        }
    };

    const processSubmit = async () => {
        try {
            setSubmitting(true);
            const formattedAnswers = Object.keys(answers).map(qId => ({
                question_id: qId,
                answer_text: answers[qId]
            }));

            const result = await submitQuiz(id as string, formattedAnswers);
            setCurrentScore(result.score);
            setStatus('RESULT');
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.detail || "Gagal mengirim jawaban.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // === RENDER METHODS ===

    if (loading) {
        return (
            <View style={styles.centerBox}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (status === 'INTRO' || status === 'LOCKED') {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <LinearGradient colors={[COLORS.primary, '#005DFF']} style={styles.introHeader}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Ionicons name={status === 'LOCKED' ? "lock-closed" : "school"} size={80} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.introTitle}>{quiz.title}</Text>
                    <Text style={styles.introSubtitle}>{quiz.class_name}</Text>
                </LinearGradient>

                <View style={styles.introCard}>
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.infoText}>{quiz.duration_minutes} Menit</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.infoText}>{quiz.questions?.length || 0} Soal</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="repeat-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.infoText}>
                            Percobaan: {quiz.user_attempts_count} / {quiz.max_attempts}
                        </Text>
                    </View>

                    {status === 'LOCKED' ? (
                        <View style={styles.resultBox}>
                            <Text style={styles.resultLabel}>Nilai Terakhir Anda</Text>
                            <Text style={styles.resultScore}>{currentScore}</Text>
                            <Text style={styles.lockedText}>Anda telah menghabiskan kesempatan mencoba.</Text>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
                            <Text style={styles.startButtonText}>Mulai Mengerjakan</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }

    if (status === 'RESULT') {
        return (
            <View style={styles.container}>
                <LinearGradient colors={[COLORS.success, '#66BB6A']} style={styles.resultHeader}>
                    <Ionicons name="checkmark-circle" size={100} color="#fff" />
                    <Text style={styles.resultTitle}>Kuis Selesai!</Text>
                </LinearGradient>
                <View style={styles.introCard}>
                    <Text style={styles.congratsText}>Jawaban berhasil dikirim.</Text>
                    <View style={styles.scoreCircle}>
                        <Text style={styles.scoreLabel}>SKOR</Text>
                        <Text style={styles.scoreValue}>{currentScore}</Text>
                    </View>
                    <TouchableOpacity style={styles.homeButton} onPress={() => router.back()}>
                        <Text style={styles.homeButtonText}>Kembali ke Daftar Kuis</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Attempt View
    return (
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.primary, '#1976D2']} style={styles.header}>
                <View>
                    <Text style={styles.headerTitle} numberOfLines={1}>{quiz.title}</Text>
                    <Text style={styles.headerSubtitle}>{formatTime(timeLeft)}</Text>
                </View>
                <TouchableOpacity onPress={() => handleSubmit(false)}>
                    <View style={styles.submitBadge}>
                        <Text style={styles.submitBadgeText}>Selesai</Text>
                    </View>
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                {quiz.questions.map((q: any, index: number) => (
                    <View key={q.id} style={styles.questionCard}>
                        <View style={styles.qHeader}>
                            <View style={styles.numberBadge}>
                                <Text style={styles.numberText}>{index + 1}</Text>
                            </View>
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

            {submitting && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: 'white', marginTop: 10 }}>Mengirim Jawaban...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Intro & Result Styles
    introHeader: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30
    },
    backButton: { position: 'absolute', top: 50, left: 20, padding: 10 },
    introTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 20, textAlign: 'center' },
    introSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 5 },

    introCard: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginTop: -60,
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',

        // Premium Shadow
        shadowColor: "#0B409C",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        width: '100%',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    infoText: { fontSize: 16, color: '#333', fontWeight: '500' },

    startButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: '100%',
        paddingVertical: 18,
        borderRadius: 16,
        marginTop: 35,
        // Button Shadow
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    },
    startButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    // Result
    resultHeader: { height: 300, justifyContent: 'center', alignItems: 'center' },
    resultTitle: { color: 'white', fontSize: 28, fontWeight: 'bold', marginTop: 20 },
    congratsText: { fontSize: 16, color: '#666', marginBottom: 20 },
    scoreCircle: {
        width: 120, height: 120, borderRadius: 60,
        borderWidth: 5, borderColor: COLORS.accent,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 30
    },
    scoreLabel: { fontSize: 14, color: '#999', fontWeight: 'bold' },
    scoreValue: { fontSize: 36, fontWeight: 'bold', color: COLORS.primary },
    homeButton: { padding: 15 },
    homeButtonText: { color: COLORS.primary, fontWeight: 'bold' },

    resultBox: { alignItems: 'center', padding: 20 },
    resultLabel: { fontSize: 14, color: '#666' },
    resultScore: { fontSize: 48, fontWeight: 'bold', color: COLORS.primary },
    lockedText: { color: COLORS.danger, marginTop: 10, textAlign: 'center' },

    // Attempt Styles
    header: {
        paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    headerTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', width: 220 },
    submitBadge: { backgroundColor: 'white', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    submitBadgeText: { color: COLORS.primary, fontWeight: 'bold' },

    content: { padding: 20, paddingBottom: 50 },
    questionCard: {
        backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 20,
        elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10
    },
    qHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    numberBadge: {
        width: 30, height: 30, borderRadius: 15, backgroundColor: '#E3F2FD',
        justifyContent: 'center', alignItems: 'center'
    },
    numberText: { color: COLORS.primary, fontWeight: 'bold' },
    qPoints: { color: "#999", fontSize: 12, marginTop: 5 },
    qText: { fontSize: 16, color: "#333", marginBottom: 20, lineHeight: 24 },

    optionsContainer: { gap: 12 },
    optionButton: {
        flexDirection: 'row', alignItems: 'center', padding: 15,
        borderRadius: 12, borderWidth: 1, borderColor: "#eee", backgroundColor: "#fff"
    },
    optionSelected: { borderColor: COLORS.primary, backgroundColor: "#E8F0FE" },
    radio: {
        width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#ddd",
        justifyContent: 'center', alignItems: 'center', marginRight: 15
    },
    radioSelected: { borderColor: COLORS.primary },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
    optionText: { fontSize: 14, color: "#444", flex: 1 },
    optionTextSelected: { color: COLORS.primary, fontWeight: '700' },

    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center'
    }
});
