import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Image, StatusBar, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchClasses } from '../../../../services/classes';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import API_BASE_URL from '../../../../config/api';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const COLORS = {
    primary: "#0B409C",
    lightGray: "#E0E0E0",
    secondary: "#FFC107",
    darkText: "#333",
    mediumText: "#666",
    bg: "#F5F6FA",
};

export default function ActivitiesScreen() {
    const router = useRouter();
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await fetchClasses('joined');
            setClasses(data);
        } catch (error) {
            console.error("Failed to load activities", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({
                pathname: "/(tabs)/students/classes/DetailClass",
                params: { classId: item.id, className: item.name }
            })}
        >
            <Image
                source={item.image ? { uri: item.image } : require('../../../../assets/images/img1.png')}
                style={styles.cardImage}
            />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardTeacher}>{item.teacher_name}</Text>

                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${item.progress || 0}%` }]} />
                </View>
                <Text style={styles.progressText}>{item.progress || 0}% Selesai</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Aktivitas Saya</Text>
            </View>

            <FlatList
                data={classes}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="book-outline" size={50} color="#ccc" />
                            <Text style={styles.emptyText}>Belum ada aktivitas kelas.</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    },
    backButton: { marginRight: 15 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    listContent: { padding: 20 },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    cardImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#eee',
        marginRight: 12,
    },
    cardContent: { flex: 1, marginRight: 10 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    cardTeacher: { fontSize: 12, color: '#666', marginBottom: 8 },

    progressContainer: {
        height: 6,
        backgroundColor: '#eee',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 3,
    },
    progressText: { fontSize: 10, color: '#888' },

    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#888', marginTop: 10 },
});
