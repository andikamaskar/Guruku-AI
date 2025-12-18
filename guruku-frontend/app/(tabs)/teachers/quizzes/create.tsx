import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Modal
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { WebView } from 'react-native-webview';

import { createQuiz, updateQuiz, getQuizDetailTeacher, generateQuizFromMaterial, Question } from '@/services/quizzes';
import { fetchClasses } from '@/services/classes';

const COLORS = {
    primary: "#0B409C",
    lightGray: "#E0E0E0",
    secondary: "#FFC107",
    darkText: "#333",
    mediumText: "#666",
    bg: "#F5F6FA",
    danger: "#D32F2F",
    success: "#388E3C",
    info: "#0288D1"
};

export default function CreateQuizScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const quizId = params.quizId as string | undefined;
    const isEditMode = !!quizId;

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Details, 2: Questions

    // Form Data - Step 1: Details
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [classId, setClassId] = useState('');
    const [duration, setDuration] = useState('60'); // Minutes
    const [deadline, setDeadline] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Data for Step 1
    const [classes, setClasses] = useState<any[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(true);

    // Form Data - Step 2: Questions
    const [questions, setQuestions] = useState<Question[]>([]);

    // Math Preview
    const [showPreview, setShowPreview] = useState(false);
    const [previewContent, setPreviewContent] = useState('');

    // AI Generation
    const [uploading, setUploading] = useState(false);

    // Initial load
    useEffect(() => {
        loadClasses();
        if (isEditMode) {
            loadQuizData(quizId);
        }
    }, [quizId]);

    const loadClasses = async () => {
        try {
            const data = await fetchClasses(); // Fetch teacher's classes
            setClasses(data);
            if (!isEditMode && data.length > 0) setClassId(data[0].id);
        } catch (error) {
            Alert.alert("Error", "Gagal memuat data kelas.");
        } finally {
            setLoadingClasses(false);
        }
    };

    const loadQuizData = async (id: string) => {
        try {
            setLoading(true);
            const data = await getQuizDetailTeacher(id);
            setTitle(data.title);
            setDescription(data.description);
            setClassId(data.class_id || (data.class_obj ? data.class_obj.id : ''));
            setDuration(data.duration_minutes.toString());
            if (data.deadline) setDeadline(new Date(data.deadline));

            // Populate questions
            if (data.questions) {
                setQuestions(data.questions.map((q: any) => ({
                    id: q.id,
                    text: q.text,
                    options: q.options,
                    answer: q.answer,
                    points: q.points,
                    order: q.order
                })));
            }
        } catch (error) {
            Alert.alert("Error", "Gagal memuat data kuis.");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleNextStep = () => {
        if (!title || !classId || !duration) {
            Alert.alert("Validasi", "Mohon lengkapi Judul, Kelas, dan Durasi.");
            return;
        }
        setStep(2);
    };

    // === AI GENERATION ===
    const handleGenerateFromAI = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], // PDF & Docx
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            setUploading(true);

            // Ask for number of questions? Default to 5 for now.
            const generatedQuestions = await generateQuizFromMaterial(file.uri, file.mimeType || 'application/pdf', file.name);

            // Merge with existing or replace? Let's append or ask user. For now, append.
            const newQuestions = generatedQuestions.map((q: any, idx: number) => ({
                id: `ai_${Date.now()}_${idx}`,
                text: q.text,
                options: q.options,
                answer: q.answer,
                points: q.points || 10,
                order: questions.length + idx + 1
            }));

            // Validate structure
            const validQuestions = newQuestions.filter((q: any) => q.text && q.options && q.answer);

            if (validQuestions.length === 0) {
                Alert.alert("Info", "Format file tidak sesuai atau AI gagal mengekstrak pertanyaan.");
            } else {
                setQuestions([...questions, ...validQuestions]);
                Alert.alert("Sukses", `Berhasil membuat ${validQuestions.length} soal dari dokumen.`);
            }

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Gagal memproses dokumen dengan AI.");
        } finally {
            setUploading(false);
        }
    };

    // === MATH PREVIEW ===
    const openMathPreview = (text: string) => {
        setPreviewContent(text);
        setShowPreview(true);
    };

    // HTML for MathJax
    const getMathHtml = (content: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
          <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
          <style>
             body { font-family: sans-serif; padding: 20px; font-size: 16px; color: #333; }
             img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <p>${content.replace(/\n/g, '<br>')}</p>
        </body>
      </html>
    `;

    // === QUESTION MANAGEMENT ===
    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                id: Date.now().toString(), // Temp ID
                text: '',
                options: ['', '', '', ''],
                answer: '',
                points: 10,
                order: questions.length + 1
            }
        ]);
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const updated = [...questions];
        const newOptions = [...updated[qIndex].options];
        newOptions[oIndex] = value;
        updated[qIndex].options = newOptions;

        // If option is currently the answer, update the answer field as well? 
        // Backend expects strict string match. 
        // Ideally we track answer by index, but model uses string.
        // Let's assume user re-selects if they change text significantly, or we could auto-update.
        // For now, no auto-update of answer field to avoid bugs.
        setQuestions(updated);
    };

    const deleteQuestion = (index: number) => {
        const updated = [...questions];
        updated.splice(index, 1);
        updated.forEach((q, i) => q.order = i + 1);
        setQuestions(updated);
    };

    const handleSubmit = async () => {
        // Validate
        if (questions.length === 0) {
            Alert.alert("Validasi", "Minimal harus ada 1 soal.");
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text) { Alert.alert("Validasi", `Soal ${i + 1}: Pertanyaan kosong.`); return; }
            if (q.options.some(opt => !opt.trim())) { Alert.alert("Validasi", `Soal ${i + 1}: Pilihan jawaban belum lengkap.`); return; }
            if (!q.answer) { Alert.alert("Validasi", `Soal ${i + 1}: Kunci jawaban belum dipilih.`); return; }
        }

        try {
            setLoading(true);
            const payload = {
                title,
                description,
                class_id: classId,
                duration_minutes: parseInt(duration),
                deadline: deadline.toISOString(),
                is_active: true,
                questions: questions.map(q => ({
                    text: q.text,
                    order: q.order,
                    points: q.points,
                    options: q.options,
                    answer: q.answer
                }))
            };

            if (isEditMode && quizId) {
                await updateQuiz(quizId, payload);
                Alert.alert("Sukses", "Kuis berhasil diperbarui!", [{ text: "OK", onPress: () => router.back() }]);
            } else {
                await createQuiz(payload);
                Alert.alert("Sukses", "Kuis berhasil dibuat!", [{ text: "OK", onPress: () => router.replace('/(tabs)/teachers/quizzes') }]);
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert("Error", error.response?.data?.detail || "Gagal menyimpan kuis.");
        } finally {
            setLoading(false);
        }
    };

    // === RENDERERS ===
    const renderStep1 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.label}>Judul Kuis</Text>
            <TextInput
                style={styles.input}
                placeholder="Contoh: Kuis Matematika Bab 1"
                value={title}
                onChangeText={setTitle}
            />

            <Text style={styles.label}>Deskripsi (Opsional)</Text>
            <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Deskripsi singkat..."
                value={description}
                onChangeText={setDescription}
                multiline
            />

            <Text style={styles.label}>Pilih Kelas</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classSelector}>
                {loadingClasses ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                    classes.map(cls => (
                        <TouchableOpacity
                            key={cls.id}
                            style={[styles.classChip, classId === cls.id && styles.classChipActive]}
                            onPress={() => setClassId(cls.id)}
                        >
                            <Text style={[styles.classChipText, classId === cls.id && styles.classChipTextActive]}>
                                {cls.name}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            <Text style={styles.label}>Durasi (Menit)</Text>
            <TextInput
                style={styles.input}
                placeholder="60"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
            />

            <Text style={styles.label}>Tenggat Waktu</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.dateText}>{deadline.toLocaleString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={deadline}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setDeadline(selectedDate);
                    }}
                />
            )}
        </View>
    );

    const renderStep2 = () => (
        <View>
            <TouchableOpacity
                style={styles.aiButton}
                onPress={handleGenerateFromAI}
                disabled={uploading}
            >
                {uploading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <>
                        <Ionicons name="sparkles" size={20} color="#fff" />
                        <Text style={styles.aiButtonText}>Generate Soal dari Dokumen (AI)</Text>
                    </>
                )}
            </TouchableOpacity>
            <Text style={styles.aiHint}>Support PDF/Docx. Soal akan otomatis ditambahkan di bawah.</Text>

            {questions.map((q, qIndex) => (
                <View key={q.id || qIndex} style={styles.questionCard}>
                    <View style={styles.questionHeader}>
                        <Text style={styles.questionTitle}>Soal {qIndex + 1}</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity onPress={() => openMathPreview(q.text)}>
                                <Ionicons name="eye-outline" size={20} color={COLORS.info} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => deleteQuestion(qIndex)}>
                                <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TextInput
                        style={styles.questionInput}
                        placeholder="Tulis pertanyaan disini... (Gunakan $$...$$ untuk matematika)"
                        value={q.text}
                        onChangeText={(val) => updateQuestion(qIndex, 'text', val)}
                        multiline
                    />

                    <View style={styles.pointsRow}>
                        <Text>Poin:</Text>
                        <TextInput
                            style={styles.pointsInput}
                            value={q.points.toString()}
                            onChangeText={(val) => updateQuestion(qIndex, 'points', parseInt(val) || 0)}
                            keyboardType="numeric"
                        />
                    </View>

                    <Text style={styles.optionLabel}>Pilihan Jawaban:</Text>
                    {q.options.map((opt, oIndex) => (
                        <View key={oIndex} style={styles.optionRow}>
                            <TouchableOpacity
                                style={[styles.radioCircle, q.answer === opt && opt !== '' && styles.radioCircleActive]}
                                onPress={() => updateQuestion(qIndex, 'answer', opt)}
                                disabled={!opt}
                            >
                                {q.answer === opt && opt !== '' && <View style={styles.selectedRb} />}
                            </TouchableOpacity>
                            <TextInput
                                style={[styles.optionInput, q.answer === opt && opt !== '' && styles.optionInputActive]}
                                placeholder={`Pilihan ${String.fromCharCode(65 + oIndex)}`}
                                value={opt}
                                onChangeText={(val) => updateOption(qIndex, oIndex, val)}
                            />
                        </View>
                    ))}
                </View>
            ))}

            <TouchableOpacity style={styles.addQuestionButton} onPress={addQuestion}>
                <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
                <Text style={styles.addQuestionText}>Tambah Soal Manual</Text>
            </TouchableOpacity>

            <View style={{ height: 100 }} />
        </View>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
            <LinearGradient colors={["#005DFF", "#0B409C"]} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => {
                        if (step === 2) setStep(1);
                        else router.back();
                    }} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {isEditMode ? "Edit Kuis" : (step === 1 ? "Buat Kuis Baru" : "Kelola Soal")}
                    </Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                {step === 1 ? renderStep1() : renderStep2()}
            </ScrollView>

            <View style={styles.footer}>
                {step === 1 ? (
                    <TouchableOpacity style={styles.mainButton} onPress={handleNextStep}>
                        <Text style={styles.mainButtonText}>Lanjut: Buat Soal</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.mainButton} onPress={handleSubmit} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.mainButtonText}>Simpan Kuis</Text>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Modal Math Preview */}
            <Modal visible={showPreview} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Preview Soal</Text>
                            <TouchableOpacity onPress={() => setShowPreview(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.webviewContainer}>
                            <WebView
                                originWhitelist={['*']}
                                source={{ html: getMathHtml(previewContent) }}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    backButton: { padding: 5 },
    headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },

    content: { flex: 1, padding: 20 },
    formContainer: { gap: 15 },
    label: { fontSize: 14, fontWeight: 'bold', color: COLORS.darkText, marginTop: 10 },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#ddd'
    },

    // Class Chip
    classSelector: { flexDirection: 'row', paddingVertical: 5 },
    classChip: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        marginRight: 10
    },
    classChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    classChipText: { fontSize: 12, color: '#666' },
    classChipTextActive: { color: '#fff', fontWeight: 'bold' },

    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        gap: 10
    },
    dateText: { fontSize: 14, color: COLORS.darkText },

    // Question Styles
    questionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        elevation: 3
    },
    questionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
    questionTitle: { fontWeight: 'bold', color: COLORS.primary },
    questionInput: {
        borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 8, fontSize: 14, marginBottom: 10
    },
    pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    pointsInput: { backgroundColor: '#f0f0f0', width: 60, borderRadius: 5, padding: 5, textAlign: 'center' },

    optionLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
    optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
    optionInput: { flex: 1, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 8, fontSize: 12 },
    optionInputActive: { borderColor: COLORS.success, backgroundColor: '#E8F5E9' },

    radioCircle: {
        height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ccc',
        alignItems: 'center', justifyContent: 'center'
    },
    radioCircleActive: { borderColor: COLORS.success },
    selectedRb: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.success },

    addQuestionButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12
    },
    addQuestionText: { color: COLORS.primary, fontWeight: 'bold' },

    // AI Button
    aiButton: {
        backgroundColor: COLORS.info,
        padding: 15,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginBottom: 5
    },
    aiButtonText: { color: '#fff', fontWeight: 'bold' },
    aiHint: { fontSize: 11, color: '#666', textAlign: 'center', marginBottom: 20 },

    footer: {
        padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee'
    },
    mainButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        padding: 15, borderRadius: 12, gap: 10
    },
    mainButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 12, height: '70%', overflow: 'hidden' },
    modalHeader: { padding: 15, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontWeight: 'bold', fontSize: 16 },
    webviewContainer: { flex: 1, padding: 10 }
});
