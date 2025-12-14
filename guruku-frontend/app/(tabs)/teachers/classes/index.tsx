import React, { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    StatusBar,
    Platform,
    RefreshControl
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BottomNav from "../../../../components/BottomNav";
import { fetchClasses } from "../../../../services/classes";
import { fetchUserProfile } from "../../../../services/user";
import FloatingButton from "../../../../components/FloatingButton"; // Maybe reuse or create custom FAB

const COLORS = {
    primary: "#0B409C",
    lightGray: "#E0E0E0",
    secondary: "#FFC107",
    darkText: "#333",
    mediumText: "#666",
    bg: "#F5F6FA",
};

interface ClassItem {
    id: string;
    name: string;
    description: string;
    grade: string;
    subject: string;
    invite_code: string;
    image?: any;
}

export default function TeacherClassesScreen() {
    const router = useRouter();
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState<any>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [classesData, userData] = await Promise.all([
                fetchClasses('joined'), // Param doesn't matter for teachers
                fetchUserProfile(),
            ]);
            setClasses(classesData);
            setUser(userData);
        } catch (error) {
            console.error("Failed to load classes:", error);
            Alert.alert("Error", "Gagal memuat daftar kelas.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleClassPress = (classId: string) => {
        router.push(`/(tabs)/teachers/classes/detail/${classId}`);
    };

    const handleCreateClass = () => {
        if (user && !user.is_verified) {
            Alert.alert("Belum Terverifikasi", "Anda harus melengkapi profil dan menunggu verifikasi admin untuk membuat kelas.");
            return;
        }
        router.push('/(tabs)/teachers/classes/create');
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={true} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
            >
                {/* HEADER */}
                <LinearGradient
                    colors={["#005DFF", "#0B409C"]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.headerTitle}>Kelas Anda</Text>
                            <Text style={styles.headerSubtitle}>Kelola kelas yang Anda ajar</Text>
                        </View>
                        {/* You can add profile picture here if needed */}
                    </View>
                </LinearGradient>

                <View style={styles.contentContainer}>
                    {loading ? (
                        <Text style={styles.loadingText}>Memuat kelas...</Text>
                    ) : classes.length > 0 ? (
                        <View style={styles.classGrid}>
                            {classes.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.cardWrapper}
                                    onPress={() => handleClassPress(item.id)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.card}>
                                        <LinearGradient
                                            colors={["#0B409C", "#0A2D69"]}
                                            style={styles.cardImagePlaceholder}
                                        >
                                            <Text style={styles.cardCode}>{item.invite_code}</Text>
                                        </LinearGradient>
                                        <View style={styles.cardContent}>
                                            <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
                                            <Text style={styles.cardSubtitle}>{item.subject} • {item.grade}</Text>
                                            <Text style={styles.cardFooter}>Kode: {item.invite_code}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>Anda belum memiliki kelas.</Text>
                            <TouchableOpacity style={styles.createButtonEmpty} onPress={handleCreateClass}>
                                <Text style={styles.createButtonText}>Buat Kelas Pertama</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* FAB for Creating Class */}
            <TouchableOpacity style={styles.fab} onPress={handleCreateClass}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>

            <BottomNav activeTab="classes" role="teacher" />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 50,
        paddingHorizontal: 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerTitle: { color: "#fff", fontSize: 24, fontWeight: "700" },
    headerSubtitle: { color: "#e7e7e7", fontSize: 14, marginTop: 5 },

    contentContainer: {
        padding: 20,
    },
    loadingText: {
        textAlign: "center",
        marginTop: 20,
        color: COLORS.mediumText,
    },
    classGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    cardWrapper: {
        width: "48%",
        marginBottom: 15,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardImagePlaceholder: {
        height: 100,
        justifyContent: "center",
        alignItems: "center",
    },
    cardCode: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 12,
        fontWeight: "bold",
    },
    cardContent: {
        padding: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: COLORS.darkText,
        marginBottom: 4,
        height: 40,
    },
    cardSubtitle: {
        fontSize: 12,
        color: COLORS.mediumText,
        marginBottom: 8,
    },
    cardFooter: {
        fontSize: 10,
        color: COLORS.primary,
        fontWeight: "600",
    },
    emptyState: {
        alignItems: "center",
        marginTop: 50,
    },
    emptyStateText: {
        fontSize: 16,
        color: COLORS.mediumText,
        marginBottom: 20,
    },
    createButtonEmpty: {
        backgroundColor: COLORS.secondary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    createButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 90, // Above bottom nav
        backgroundColor: COLORS.secondary,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fabIcon: {
        fontSize: 32,
        color: "#fff",
        fontWeight: "bold",
        marginTop: -2,
    }
});
