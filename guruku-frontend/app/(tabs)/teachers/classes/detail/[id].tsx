import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, ActivityIndicator, FlatList, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMaterials, createMaterial, deleteMaterial, Material } from '../../../../../services/materials';
import { updateClass, getClassStudents, getAnnouncements, createAnnouncement, fetchClassDetails } from '../../../../../services/classes';
import MaterialItem from '../../../../../components/teacher/materials/MaterialItem';
import CreateMaterialModal from '../../../../../components/teacher/materials/CreateMaterialModal';
import { Image } from 'expo-image';

export default function ClassDetail() {
    const router = useRouter();
    const { id, name, description } = useLocalSearchParams();
    // Actually typically we need to fetch class details if not passed. 
    // For now assuming we might just edit what we have or generic fields.
    // Let's assume we can edit Name and Description.

    const [activeTab, setActiveTab] = useState('materials');
    const [materials, setMaterials] = useState<Material[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Edit Class State
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [className, setClassName] = useState((name as string) || "");
    const [classDesc, setClassDesc] = useState((description as string) || "");
    // Use separate state for displayed info to ensure it updates from fetch
    const [displayClassName, setDisplayClassName] = useState((name as string) || "");
    const [displayClassDesc, setDisplayClassDesc] = useState((description as string) || "");

    const [isUpdating, setIsUpdating] = useState(false);

    // Announcement State
    const [newAnnouncement, setNewAnnouncement] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        fetchClassInfo();
    }, []);

    useEffect(() => {
        if (activeTab === 'materials') {
            fetchMaterials();
        } else if (activeTab === 'students') {
            fetchStudents();
        } else if (activeTab === 'info') {
            fetchAnnouncements();
        }
    }, [activeTab]);

    const fetchClassInfo = async () => {
        try {
            const data = await fetchClassDetails(id as string);
            setClassName(data.name);
            setClassDesc(data.description);
            setDisplayClassName(data.name);
            setDisplayClassDesc(data.description);
        } catch (error) {
            console.error("Failed to fetch class info", error);
        }
    }

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const data = await getMaterials(id as string);
            setMaterials(data);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Gagal memuat materi");
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await getClassStudents(id as string);
            setStudents(data);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Gagal memuat daftar siswa");
        } finally {
            setLoading(false);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const data = await getAnnouncements(id as string);
            setAnnouncements(data);
        } catch (error) {
            console.error(error);
            // Don't alert here to avoid noise, maybe log or simple toast
        } finally {
            setLoading(false);
        }
    };

    const handlePostAnnouncement = async () => {
        if (!newAnnouncement.trim()) return;

        try {
            setIsPosting(true);
            await createAnnouncement(id as string, newAnnouncement);
            setNewAnnouncement("");
            fetchAnnouncements();
            Alert.alert("Sukses", "Pengumuman berhasil diposting");
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Gagal memposting pengumuman");
        } finally {
            setIsPosting(false);
        }
    };

    const handleCreateMaterial = async (data: any) => {
        try {
            await createMaterial(id as string, data);
            Alert.alert("Sukses", "Materi berhasil dibuat");
            fetchMaterials();
        } catch (error) {
            console.error(error);
            throw error; // Let modal handle error display if needed
        }
    };

    const handleDeleteMaterial = async (materialId: string) => {
        Alert.alert(
            "Hapus Materi",
            "Apakah Anda yakin ingin menghapus materi ini?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Hapus",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteMaterial(materialId);
                            setMaterials(prev => prev.filter(m => m.id !== materialId));
                        } catch (error) {
                            Alert.alert("Error", "Gagal menghapus materi");
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateClass = async () => {
        if (!className) {
            Alert.alert("Error", "Nama kelas tidak boleh kosong");
            return;
        }

        try {
            setIsUpdating(true);
            await updateClass(id as string, { name: className, description: classDesc });
            setDisplayClassName(className);
            setDisplayClassDesc(classDesc);
            Alert.alert("Sukses", "Kelas berhasil diperbarui");
            setEditModalVisible(false);
            // Optional: Router replace to update params or fetch class details
            // For now simple alert
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Gagal memperbarui kelas");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Kelas</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.backButton}>
                    <Ionicons name="create-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'info' && styles.activeTab]}
                    onPress={() => setActiveTab('info')}
                >
                    <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>Informasi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'materials' && styles.activeTab]}
                    onPress={() => setActiveTab('materials')}
                >
                    <Text style={[styles.tabText, activeTab === 'materials' && styles.activeTabText]}>Materi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'students' && styles.activeTab]}
                    onPress={() => setActiveTab('students')}
                >
                    <Text style={[styles.tabText, activeTab === 'students' && styles.activeTabText]}>Siswa</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {activeTab === 'materials' && (
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setModalVisible(true)}
                        >
                            <Ionicons name="add" size={24} color="#fff" />
                            <Text style={styles.addButtonText}>Tambah Materi</Text>
                        </TouchableOpacity>

                        {loading ? (
                            <ActivityIndicator size="large" color="#0B409C" style={{ marginTop: 20 }} />
                        ) : (
                            <FlatList
                                data={materials}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <View>
                                        <TouchableOpacity
                                            onPress={() => router.push({
                                                pathname: '/(tabs)/teachers/classes/material/[id]',
                                                params: { id: item.id }
                                            })}
                                        >
                                            <MaterialItem
                                                item={item}
                                                onDelete={handleDeleteMaterial}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>Belum ada materi di kelas ini.</Text>
                                }
                            />
                        )}
                    </View>
                )}

                {activeTab === 'info' && (
                    <ScrollView style={{ flex: 1 }}>
                        <View style={styles.infoCard}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{displayClassName || "Nama Kelas"}</Text>
                            <Text style={{ marginTop: 10, color: '#666', lineHeight: 22 }}>{displayClassDesc || "Tidak ada deskripsi."}</Text>
                        </View>

                        <View style={styles.announcementSection}>
                            <Text style={styles.sectionTitle}>Pengumuman</Text>

                            <View style={styles.postCard}>
                                <TextInput
                                    style={styles.postInput}
                                    placeholder="Bagikan sesuatu dengan kelas..."
                                    value={newAnnouncement}
                                    onChangeText={setNewAnnouncement}
                                    multiline
                                />
                                <TouchableOpacity
                                    style={[styles.postButton, (!newAnnouncement.trim() || isPosting) && styles.disabledButton]}
                                    onPress={handlePostAnnouncement}
                                    disabled={!newAnnouncement.trim() || isPosting}
                                >
                                    {isPosting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.postButtonText}>Posting</Text>}
                                </TouchableOpacity>
                            </View>

                            {announcements.map((announcement) => (
                                <View key={announcement.id} style={styles.announcementCard}>
                                    <View style={styles.announcementHeader}>
                                        <Text style={styles.announcerName}>{announcement.teacher_name}</Text>
                                        <Text style={styles.announcementDate}>
                                            {new Date(announcement.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                    <Text style={styles.announcementContent}>{announcement.content}</Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                )}

                {activeTab === 'students' && (
                    <View style={{ flex: 1 }}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#0B409C" style={{ marginTop: 20 }} />
                        ) : (
                            <FlatList
                                data={students}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <View style={styles.studentItem}>
                                        <View style={styles.studentAvatar}>
                                            {item.avatar ? (
                                                <Image
                                                    source={{ uri: item.avatar }}
                                                    style={{ width: 40, height: 40, borderRadius: 20 }}
                                                    contentFit="cover"
                                                />
                                            ) : (
                                                <Text style={styles.studentAvatarText}>
                                                    {item.full_name ? item.full_name.charAt(0).toUpperCase() : "?"}
                                                </Text>
                                            )}
                                        </View>
                                        <View>
                                            <Text style={styles.studentName}>{item.full_name}</Text>
                                            <Text style={styles.studentEmail}>{item.email}</Text>
                                        </View>
                                    </View>
                                )}
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>Belum ada siswa yang bergabung.</Text>
                                }
                            />
                        )}
                    </View>
                )}
            </View>

            <CreateMaterialModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleCreateMaterial}
            />

            {/* Edit Class Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Kelas</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Nama Kelas</Text>
                            <TextInput
                                style={styles.input}
                                value={className}
                                onChangeText={setClassName}
                                placeholder="Nama Kelas"
                            />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Deskripsi</Text>
                            <TextInput
                                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                value={classDesc}
                                onChangeText={setClassDesc}
                                placeholder="Deskripsi Kelas"
                                multiline
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, isUpdating && styles.disabledButton]}
                            onPress={handleUpdateClass}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Simpan Perubahan</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#0B409C',
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#0B409C',
        paddingBottom: 5,
        marginBottom: -17, // Visual trick for active underline
    },
    tabText: {
        fontSize: 16,
        color: '#999',
    },
    activeTabText: {
        color: '#0B409C',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    addButton: {
        backgroundColor: '#0B409C',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 10,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', // Center for small modal
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0B409C',
    },
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#F9F9F9',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#0B409C',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#A0A0A0',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    studentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    studentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#0B409C',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        overflow: 'hidden',
    },
    studentAvatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    studentEmail: {
        fontSize: 13,
        color: '#666',
    },
    // Announcement & Info Styles
    infoCard: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20,
        borderRadius: 12,
        elevation: 2,
    },
    announcementSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0B409C',
        marginBottom: 15,
    },
    postCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
    },
    postInput: {
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        padding: 12,
        height: 80,
        textAlignVertical: 'top',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    postButton: {
        backgroundColor: '#0B409C',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignSelf: 'flex-end',
    },
    postButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    announcementCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    announcementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    announcerName: {
        fontWeight: 'bold',
        color: '#333',
    },
    announcementDate: {
        fontSize: 12,
        color: '#999',
    },
    announcementContent: {
        color: '#444',
        lineHeight: 20,
    },
});
