import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { fetchStudentQuizzes, Quiz } from "../../../../services/quizzes";

const COLORS = {
    primary: "#0B409C",
    bg: "#F5F6FA",
    secondary: "#FFC107",
};

export default function ActiveQuizzesScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeQuizzes, setActiveQuizzes] = useState<Quiz[]>([]);

    useEffect(() => {
        loadActiveQuizzes();
    }, []);

    const loadActiveQuizzes = async () => {
        try {
            setLoading(true);
            const quizzes = await fetchStudentQuizzes();
            const now = new Date();

            const filtered = quizzes.filter((q: Quiz) => {
                const isFuture = q.deadline ? new Date(q.deadline) > now : true;
                const attempts = q.user_attempts_count || 0;
                const max = q.max_attempts || 1;
                const hasAttempts = attempts < max;

                return isFuture && hasAttempts && q.is_active;
            });

            setActiveQuizzes(filtered);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Quiz }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(tabs)/students/quizzes/${item.id}/attempt`)}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <View style={styles.tagContainer}>
                    <Ionicons name="time-outline" size={14} color="#E65100" />
                    <Text style={styles.tagText}>{item.duration_minutes} Menit</Text>
                </View>
                <View style={[styles.tagContainer, { backgroundColor: '#E3F2FD' }]}>
                    <Ionicons name="school-outline" size={14} color={COLORS.primary} />
                    <Text style={[styles.tagText, { color: COLORS.primary }]}>{item.class_name}</Text>
                </View>
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>
                {item.description || "Tidak ada deskripsi."}
            </Text>

            <View style={styles.cardFooter}>
                <Text style={styles.attempts}>
                    Percobaan: <Text style={{ fontWeight: 'bold' }}>{item.user_attempts_count || 0}/{item.max_attempts}</Text>
                </Text>
                <View style={styles.btn}>
                    <Text style={styles.btnText}>Kerjakan</Text>
                    <Ionicons name="arrow-forward" size={16} color="white" />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Aktivitas Sedang Berjalan</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : activeQuizzes.length > 0 ? (
                <FlatList
                    data={activeQuizzes}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="checkmark-circle-outline" size={80} color="#ccc" />
                    <Text style={styles.emptyTitle}>Tidak Ada Kuis Aktif</Text>
                    <Text style={styles.emptySubtitle}>
                        Hore! Kamu tidak memiliki kuis atau tugas yang perlu dikerjakan saat ini.
                    </Text>
                    <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.back()}>
                        <Text style={styles.backHomeText}>Kembali</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 4
    },
    backBtn: { marginRight: 15 },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },

    list: { padding: 20 },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    cardHeader: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    tagContainer: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6
    },
    tagText: { fontSize: 12, fontWeight: 'bold', color: '#E65100' },

    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    cardDesc: { fontSize: 13, color: '#666', marginBottom: 15 },

    cardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 15
    },
    attempts: { fontSize: 12, color: '#888' },
    btn: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20
    },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

    // Empty State
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 20 },
    emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 10, lineHeight: 20 },
    backHomeBtn: {
        marginTop: 30,
        paddingVertical: 10, paddingHorizontal: 25,
        borderWidth: 1, borderColor: COLORS.primary,
        borderRadius: 20
    },
    backHomeText: { color: COLORS.primary, fontWeight: 'bold' }
});
