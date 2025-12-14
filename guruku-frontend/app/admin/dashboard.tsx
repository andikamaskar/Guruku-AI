import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { fetchAdminStats, fetchVerificationRequests, verifyUser } from '../../services/admin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from "../../config/api";

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const statsData = await fetchAdminStats();
            const reqData = await fetchVerificationRequests();
            setStats(statsData);
            setRequests(reqData);
        } catch (error) {
            console.error("Failed to load admin data", error);
            Alert.alert("Error", "Gagal memuat data admin");
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

    const handleVerify = async (userId: number) => {
        try {
            await verifyUser(userId);
            Alert.alert("Sukses", "User berhasil diverifikasi");
            setSelectedUser(null);
            loadData();
        } catch (error) {
            Alert.alert("Error", "Gagal verifikasi user");
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('userRole');
        router.replace('/Login');
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={['#1a2a6c', '#b21f1f', '#fdbb2d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
                <Text style={styles.headerTitle}>Admin Dashboard</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Log Out</Text>
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
                contentContainerStyle={{ padding: 20 }}
            >
                {/* Stats Cards */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats?.total_users || 0}</Text>
                        <Text style={styles.statLabel}>Total Users</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats?.students_count || 0}</Text>
                        <Text style={styles.statLabel}>Students</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats?.teachers_count || 0}</Text>
                        <Text style={styles.statLabel}>Teachers</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#ffebee' }]}>
                        <Text style={[styles.statValue, { color: 'red' }]}>{stats?.pending_verification || 0}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Permintaan Verifikasi</Text>

                {requests.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Tidak ada permintaan verifikasi.</Text>
                ) : (
                    requests.map((user) => (
                        <View key={user.id} style={styles.requestCard}>
                            <Image
                                source={{
                                    uri: user.profile_picture
                                        ? (user.profile_picture.startsWith('http')
                                            ? user.profile_picture
                                            : `${API_BASE_URL.replace('/api', '')}${user.profile_picture}`) + `?t=${new Date().getTime()}`
                                        : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                                }}
                                style={styles.avatar}
                            />
                            <View style={styles.requestInfo}>
                                <Text style={styles.reqName}>{user.full_name} ({user.role})</Text>
                                <Text style={styles.reqDetail}>{user.email}</Text>
                                {user.role === 'student' ? (
                                    <>
                                        <Text style={styles.reqDetail}>NISN: {user.nisn || '-'}</Text>
                                        <Text style={styles.reqDetail}>Grade: {user.grade || '-'}</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.reqDetail}>NIP: {user.nip || '-'}</Text>
                                        <Text style={styles.reqDetail}>Mapel: {user.subject || '-'}</Text>
                                    </>
                                )}
                            </View>
                            <TouchableOpacity style={styles.verifyBtn} onPress={() => setSelectedUser(user)}>
                                <Text style={styles.verifyText}>View</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}

            </ScrollView>

            {/* User Detail Modal */}
            <Modal visible={!!selectedUser} transparent animationType="fade" onRequestClose={() => setSelectedUser(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Verifikasi Siswa</Text>
                        {selectedUser && (
                            <>
                                <Image
                                    source={{
                                        uri: selectedUser.profile_picture
                                            ? (selectedUser.profile_picture.startsWith('http')
                                                ? selectedUser.profile_picture
                                                : `${API_BASE_URL.replace('/api', '')}${selectedUser.profile_picture}`) + `?t=${new Date().getTime()}`
                                            : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                                    }}
                                    style={styles.modalAvatar}
                                />
                                <View style={{ width: '100%', marginVertical: 10 }}>
                                    <Text style={styles.label}>Nama:</Text>
                                    <Text style={styles.value}>{selectedUser.full_name}</Text>
                                    <Text style={styles.label}>Email:</Text>
                                    <Text style={styles.value}>{selectedUser.email}</Text>

                                    {selectedUser.role === 'student' ? (
                                        <>
                                            <Text style={styles.label}>NISN:</Text>
                                            <Text style={styles.value}>{selectedUser.nisn || 'Not provided'}</Text>
                                            <Text style={styles.label}>Grade:</Text>
                                            <Text style={styles.value}>{selectedUser.grade || 'Not provided'}</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={styles.label}>NIP:</Text>
                                            <Text style={styles.value}>{selectedUser.nip || 'Not provided'}</Text>
                                            <Text style={styles.label}>Mata Pelajaran:</Text>
                                            <Text style={styles.value}>{selectedUser.subject || 'Not provided'}</Text>
                                        </>
                                    )}
                                </View>

                                <View style={styles.modalActions}>
                                    <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setSelectedUser(null)}>
                                        <Text style={{ color: 'black' }}>Batal</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.btn, styles.confirmBtn]} onPress={() => handleVerify(selectedUser.id)}>
                                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Verifikasi</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f4' },
    header: { padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
    statCard: { width: '48%', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2, alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    statLabel: { fontSize: 14, color: '#666' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    requestCard: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 1, alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
    requestInfo: { flex: 1 },
    reqName: { fontSize: 16, fontWeight: 'bold' },
    reqDetail: { fontSize: 12, color: '#666' },
    verifyBtn: { backgroundColor: '#0B409C', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5 },
    verifyText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    modalAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 15 },
    label: { fontSize: 12, color: '#888', marginTop: 5 },
    value: { fontSize: 16, fontWeight: '500', marginBottom: 5 },
    modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 20 },
    btn: { flex: 1, padding: 12, borderRadius: 5, alignItems: 'center', marginHorizontal: 5 },
    cancelBtn: { backgroundColor: '#eee' },
    confirmBtn: { backgroundColor: '#4CAF50' },
});
