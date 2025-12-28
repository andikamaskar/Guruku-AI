import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { fetchAdminStats, fetchVerificationRequests, verifyUser, createAnnouncement } from '../../services/admin';
import { resolveImageUrl } from '../../services/api';

const AdminDashboard = () => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal & Form States
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', target_role: 'all' });
    const [selectedUser, setSelectedUser] = useState<any>(null);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const statsData = await fetchAdminStats();
            const requestsData = await fetchVerificationRequests();
            setStats(statsData);
            setVerificationRequests(requestsData);
        } catch (error) {
            console.error("Failed to load admin data", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleVerifyUser = async (userId: string, status: 'verified' | 'rejected') => {
        try {
            await verifyUser(userId, status);
            Alert.alert("Sukses", `User berhasil ${status === 'verified' ? 'diverifikasi' : 'ditolak'}`);
            setSelectedUser(null);
            loadData();
        } catch (error) {
            Alert.alert("Error", "Gagal memproses verifikasi");
        }
    };

    const handleCreateAnnouncement = async () => {
        try {
            await createAnnouncement(announcementForm);
            Alert.alert("Sukses", "Pengumuman berhasil dibuat");
            setShowAnnouncementModal(false);
            setAnnouncementForm({ title: '', content: '', target_role: 'all' });
        } catch (error) {
            Alert.alert("Error", "Gagal membuat pengumuman");
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <LinearGradient
                    colors={['#004aad', '#042b69']}
                    style={styles.header}
                >
                    <Text style={styles.headerTitle}>Admin Dashboard</Text>
                    <Text style={styles.headerSubtitle}>Kelola sistem Guruku AI</Text>
                </LinearGradient>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats?.total_students || 0}</Text>
                        <Text style={styles.statLabel}>Siswa</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats?.total_teachers || 0}</Text>
                        <Text style={styles.statLabel}>Guru</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats?.total_classes || 0}</Text>
                        <Text style={styles.statLabel}>Kelas</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setShowAnnouncementModal(true)}
                    >
                        <Text style={styles.actionButtonText}>+ Buat Pengumuman</Text>
                    </TouchableOpacity>
                </View>

                {/* Verification Requests */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Permintaan Verifikasi</Text>
                    <Text style={styles.badge}>{verificationRequests.length}</Text>
                </View>

                {verificationRequests.length === 0 ? (
                    <Text style={styles.emptyText}>Tidak ada permintaan verifikasi.</Text>
                ) : (
                    verificationRequests.map((user) => (
                        <View key={user.id} style={styles.requestCard}>
                            <Image
                                source={{
                                    uri: user.profile_picture
                                        ? resolveImageUrl(user.profile_picture)!
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

            {/* Announcement Modal */}
            <Modal visible={showAnnouncementModal} transparent animationType="slide" onRequestClose={() => setShowAnnouncementModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Buat Pengumuman</Text>

                        <Text style={styles.label}>Judul</Text>
                        <TextInput
                            style={styles.input}
                            value={announcementForm.title}
                            onChangeText={(text) => setAnnouncementForm({ ...announcementForm, title: text })}
                        />

                        <Text style={styles.label}>Konten</Text>
                        <TextInput
                            style={[styles.input, styles.contentInput]}
                            value={announcementForm.content}
                            onChangeText={(text) => setAnnouncementForm({ ...announcementForm, content: text })}
                            multiline
                        />

                        {/* Simple Role Selector */}
                        <Text style={styles.label}>Target</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                            {['all', 'teacher', 'student'].map(role => (
                                <TouchableOpacity
                                    key={role}
                                    style={[styles.roleBadge, announcementForm.target_role === role && styles.roleBadgeActive]}
                                    onPress={() => setAnnouncementForm({ ...announcementForm, target_role: role })}
                                >
                                    <Text style={{ color: announcementForm.target_role === role ? 'white' : 'black', textTransform: 'capitalize' }}>
                                        {role}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setShowAnnouncementModal(false)}>
                                <Text style={styles.btnText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.confirmBtn]} onPress={handleCreateAnnouncement}>
                                <Text style={styles.btnText}>Kirim</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Verification Detail Modal */}
            <Modal visible={selectedUser !== null} transparent animationType="slide" onRequestClose={() => setSelectedUser(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedUser && (
                            <>
                                <View style={{ alignItems: 'center', marginBottom: 15 }}>
                                    <Image
                                        source={{
                                            uri: selectedUser.profile_picture
                                                ? resolveImageUrl(selectedUser.profile_picture)!
                                                : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                                        }}
                                        style={styles.modalAvatar}
                                    />
                                    <Text style={styles.modalTitle}>{selectedUser.full_name}</Text>
                                    <View style={[styles.badge, { marginTop: 5, backgroundColor: selectedUser.role === 'teacher' ? '#004aad' : '#4CAF50' }]}>
                                        <Text style={{ color: 'white', textTransform: 'capitalize' }}>{selectedUser.role}</Text>
                                    </View>
                                </View>

                                <View style={styles.userInfoContainer}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Email</Text>
                                        <Text style={styles.infoValue}>{selectedUser.email}</Text>
                                    </View>
                                    {selectedUser.role === 'teacher' ? (
                                        <>
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoLabel}>NIP</Text>
                                                <Text style={styles.infoValue}>{selectedUser.nip || '-'}</Text>
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoLabel}>Mata Pelajaran</Text>
                                                <Text style={styles.infoValue}>{selectedUser.subject || '-'}</Text>
                                            </View>
                                        </>
                                    ) : (
                                        <>
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoLabel}>NISN</Text>
                                                <Text style={styles.infoValue}>{selectedUser.nisn || '-'}</Text>
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoLabel}>Grade</Text>
                                                <Text style={styles.infoValue}>{selectedUser.grade || '-'}</Text>
                                            </View>
                                        </>
                                    )}
                                </View>

                                <View style={styles.verifyActions}>
                                    <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => handleVerifyUser(selectedUser.id, 'rejected')}>
                                        <Text style={styles.btnText}>Tolak</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.btn, styles.btnVerify]} onPress={() => handleVerifyUser(selectedUser.id, 'verified')}>
                                        <Text style={styles.btnText}>Verifikasi</Text>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity style={{ marginTop: 15, alignSelf: 'center' }} onPress={() => setSelectedUser(null)}>
                                    <Text style={{ color: '#666' }}>Tutup</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        padding: 20,
        paddingTop: 60,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginTop: 5,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        marginTop: -30,
    },
    statCard: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        width: '30%',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#004aad',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    actionContainer: {
        padding: 20,
    },
    actionButton: {
        backgroundColor: '#004aad',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 10,
    },
    badge: {
        backgroundColor: '#FFC107',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
        overflow: 'hidden',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
        fontStyle: 'italic',
    },
    requestCard: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    requestInfo: {
        flex: 1,
    },
    reqName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    reqDetail: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    verifyBtn: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    verifyText: {
        color: '#004aad',
        fontWeight: 'bold',
        fontSize: 12,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#004aad',
    },
    modalAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        fontSize: 14,
    },
    contentInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginBottom: 20,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    roleBadge: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
    },
    roleBadgeActive: {
        backgroundColor: '#004aad',
    },
    modalActions: { // Fixed: added missing style
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    btn: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    btnCancel: {
        backgroundColor: '#ccc',
    },
    cancelBtn: { // Fixed alias
        backgroundColor: '#ccc',
    },
    btnSave: {
        backgroundColor: '#004aad',
    },
    confirmBtn: { // Fixed alias
        backgroundColor: '#004aad',
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
    },
    userInfoContainer: {
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    infoLabel: {
        color: '#666',
        flex: 1,
    },
    infoValue: {
        fontWeight: 'bold',
        color: '#333',
        flex: 2,
        textAlign: 'right',
    },
    value: { // Fixed alias
        fontWeight: 'bold',
        color: '#333',
        fontSize: 16,
    },
    verifyActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    btnReject: {
        backgroundColor: '#d9534f',
    },
    btnVerify: {
        backgroundColor: '#4CAF50',
    },
});

export default AdminDashboard;
