import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Alert, Image, Modal, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchQuizAttempts } from '@/services/quizzes';
import API_BASE_URL from '@/config/api';

const COLORS = {
    primary: "#0B409C",
    bg: "#F5F6FA",
    secondary: "#FFC107",
    success: "#2E7D32",
    successBg: "#E8F5E9",
    darkText: "#333",
    mediumText: "#666",
    white: '#fff',
    border: '#E0E0E0'
};

interface Attempt {
    id: string;
    student_name: string;
    student_avatar: string | null;
    score: number;
    submitted_at: string;
    attempt_number: number;
    user: number; // user id
}

interface StudentGroup {
    user_id: number;
    student_name: string;
    student_avatar: string | null;
    attempts: Attempt[];
    latest_score: number;
    best_score: number;
    total_attempts: number;
}

export default function QuizScores() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [groupedAttempts, setGroupedAttempts] = useState<StudentGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<StudentGroup | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const loadAttempts = async () => {
        try {
            setLoading(true);
            if (!id) return;
            const data: Attempt[] = await fetchQuizAttempts(id as string);

            // Group by User
            const groups: { [key: number]: StudentGroup } = {};

            data.forEach(attempt => {
                if (!groups[attempt.user]) {
                    groups[attempt.user] = {
                        user_id: attempt.user,
                        student_name: attempt.student_name,
                        student_avatar: attempt.student_avatar,
                        attempts: [],
                        latest_score: 0,
                        best_score: 0,
                        total_attempts: 0
                    };
                }
                groups[attempt.user].attempts.push(attempt);
            });

            // Calculate Stats for each group
            const result = Object.values(groups).map(group => {
                // Sort attempts by date descending (latest first)
                group.attempts.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

                group.total_attempts = group.attempts.length;
                group.latest_score = group.attempts[0]?.score || 0;
                group.best_score = Math.max(...group.attempts.map(a => a.score));

                return group;
            });

            setGroupedAttempts(result);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Gagal memuat daftar nilai siswa.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadAttempts();
        }, [id])
    );

    const getProfileImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        // Remove /api if present in base url to avoid double /api/media path issues if backend returns relative media url
        const baseUrl = API_BASE_URL.replace('/api', '');
        return `${baseUrl}${path}`;
    };

    const handleStudentPress = (student: StudentGroup) => {
        setSelectedStudent(student);
        setModalVisible(true);
    };

    const renderItem = ({ item }: { item: StudentGroup }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleStudentPress(item)}>
            <View style={styles.row}>
                {/* Profile Picture */}
                <View style={styles.avatarContainer}>
                    {item.student_avatar ? (
                        <Image
                            source={{ uri: getProfileImageUrl(item.student_avatar)! }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {item.student_name ? item.student_name.charAt(0).toUpperCase() : "?"}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.infoContent}>
                    <Text style={styles.studentName}>{item.student_name || "Siswa Tanpa Nama"}</Text>
                    <Text style={styles.attemptText}>{item.total_attempts}x Percobaan</Text>
                </View>

                {/* Score */}
                <View style={styles.scoreContainer}>
                    <Text style={styles.labelScore}>Nilai Terakhir</Text>
                    <View style={[
                        styles.scoreBadge,
                        { backgroundColor: item.latest_score >= 70 ? COLORS.successBg : '#FFEBEE' }
                    ]}>
                        <Text style={[
                            styles.scoreText,
                            { color: item.latest_score >= 70 ? COLORS.success : '#C62828' }
                        ]}>
                            {item.latest_score}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderDetailModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Riwayat Pengerjaan</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {selectedStudent && (
                        <>
                            <View style={styles.studentSummary}>
                                <Text style={styles.summaryName}>{selectedStudent.student_name}</Text>
                                <Text style={styles.summaryStats}>Best Score: {selectedStudent.best_score}</Text>
                            </View>

                            <ScrollView style={styles.attemptsList}>
                                {selectedStudent.attempts.map((attempt, index) => (
                                    <View key={attempt.id} style={styles.attemptItem}>
                                        <View style={styles.attemptLeft}>
                                            <Text style={styles.attemptNumber}>Percobaan ke-{attempt.attempt_number}</Text>
                                            <Text style={styles.attemptDate}>
                                                {new Date(attempt.submitted_at).toLocaleString()}
                                            </Text>
                                        </View>
                                        <View style={[
                                            styles.attemptScoreBadge,
                                            { backgroundColor: attempt.score >= 70 ? COLORS.successBg : '#FFEBEE' }
                                        ]}>
                                            <Text style={[
                                                styles.attemptScoreText,
                                                { color: attempt.score >= 70 ? COLORS.success : '#C62828' }
                                            ]}>{attempt.score}</Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <LinearGradient
                colors={["#005DFF", "#0B409C"]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Nilai Siswa</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={groupedAttempts}
                    keyExtractor={(item) => item.user_id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="school-outline" size={50} color="#ccc" />
                            <Text style={styles.emptyText}>Belum ada siswa yang mengerjakan.</Text>
                        </View>
                    }
                />
            )}

            {renderDetailModal()}
        </View>
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
    backButton: {
        padding: 5
    },
    headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
    listContent: { padding: 20 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatar: {
        width: '100%',
        height: '100%'
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold'
    },
    infoContent: {
        flex: 1,
        gap: 4
    },
    studentName: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.darkText
    },
    attemptText: {
        fontSize: 12,
        color: COLORS.mediumText,
    },
    scoreContainer: {
        alignItems: 'flex-end',
        gap: 4
    },
    labelScore: {
        fontSize: 10,
        color: COLORS.mediumText
    },
    scoreBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        minWidth: 50,
        alignItems: 'center'
    },
    scoreText: {
        fontWeight: "bold",
        fontSize: 16
    },
    emptyState: { alignItems: "center", marginTop: 50 },
    emptyText: { color: "#999", marginTop: 10 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkText
    },
    studentSummary: {
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border
    },
    summaryName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 5
    },
    summaryStats: {
        fontSize: 14,
        color: COLORS.mediumText,
        fontWeight: '600'
    },
    attemptsList: {
        marginBottom: 20
    },
    attemptItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    attemptLeft: {
        gap: 4
    },
    attemptNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.darkText
    },
    attemptDate: {
        fontSize: 12,
        color: COLORS.mediumText
    },
    attemptScoreBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8
    },
    attemptScoreText: {
        fontWeight: 'bold',
        fontSize: 14
    }
});
