import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchTeacherQuizzes, deleteQuiz } from '@/services/quizzes';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
    primary: "#0B409C",
    lightGray: "#E0E0E0",
    secondary: "#FFC107",
    darkText: "#333",
    mediumText: "#666",
    bg: "#F5F6FA",
    danger: "#D32F2F",
    info: "#1976D2"
};

export default function TeacherQuizList() {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            const data = await fetchTeacherQuizzes();
            setQuizzes(data);
        } catch (error) {
            Alert.alert("Error", "Gagal memuat daftar kuis.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            "Konfirmasi Hapus",
            "Apakah Anda yakin ingin menghapus kuis ini?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Hapus",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteQuiz(id);
                            loadQuizzes();
                        } catch (error) {
                            Alert.alert("Error", "Gagal menghapus kuis.");
                        }
                    }
                }
            ]
        );
    };

    useFocusEffect(
        useCallback(() => {
            loadQuizzes();
        }, [])
    );

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.quizTitle}>{item.title}</Text>
                <View style={[styles.badge, { backgroundColor: item.is_active ? '#E8F5E9' : '#FFEBEE' }]}>
                    <Text style={{ fontSize: 10, color: item.is_active ? '#2E7D32' : '#C62828', fontWeight: 'bold' }}>
                        {item.is_active ? 'AKTIF' : 'NON-AKTIF'}
                    </Text>
                </View>
            </View>

            <Text style={styles.quizClass}>{item.class_name}</Text>

            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.infoText}>{item.duration_minutes} Menit</Text>
                </View>
                <View style={styles.infoItem}>
                    <Ionicons name="help-circle-outline" size={14} color="#666" />
                    <Text style={styles.infoText}>{item.total_questions} Soal</Text>
                </View>
                <View style={styles.infoItem}>
                    <Ionicons name="star-outline" size={14} color="#666" />
                    <Text style={styles.infoText}>Max: {item.max_score}</Text>
                </View>
            </View>

            {item.deadline && (
                <View style={styles.deadlineRow}>
                    <Ionicons name="calendar-outline" size={14} color="#D32F2F" />
                    <Text style={styles.deadlineText}>
                        Deadline: {new Date(item.deadline).toLocaleString()}
                    </Text>
                </View>
            )}

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => router.push({
                        pathname: '/(tabs)/teachers/quizzes/create',
                        params: { quizId: item.id }
                    })}
                >
                    <Ionicons name="create-outline" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.scoreBtn]}
                    onPress={() => router.push({
                        pathname: '/(tabs)/teachers/quizzes/[id]/scores',
                        params: { id: item.id }
                    })}
                >
                    <Ionicons name="list-outline" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Nilai</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(item.id)}
                >
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Hapus</Text>
                </TouchableOpacity>
            </View>

        </View>
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
                    <Text style={styles.headerTitle}>Daftar Kuis</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={quizzes}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="document-text-outline" size={50} color="#ccc" />
                            <Text style={styles.emptyText}>Belum ada kuis yang dibuat.</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/(tabs)/teachers/quizzes/create')}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
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
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 5
    },
    quizTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.darkText, flex: 1, marginRight: 10 },
    quizClass: { fontSize: 14, color: COLORS.primary, marginBottom: 10, fontWeight: '600' },
    infoRow: { flexDirection: "row", gap: 15, marginBottom: 8 },
    infoItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    infoText: { fontSize: 12, color: "#666" },
    deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
    deadlineText: { fontSize: 12, color: "#D32F2F" },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 30,
        backgroundColor: COLORS.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000", // Shadow for iOS
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    emptyState: { alignItems: "center", marginTop: 50 },
    emptyText: { color: "#999", marginTop: 10 },

    actionRow: {
        flexDirection: 'row',
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
        gap: 10
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 5
    },
    editBtn: { backgroundColor: COLORS.info }, // Blue
    scoreBtn: { backgroundColor: COLORS.secondary }, // Yellow
    deleteBtn: { backgroundColor: COLORS.danger }, // Red
    actionBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});
