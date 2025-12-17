import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, FlatList, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMaterials, createMaterial, deleteMaterial, Material } from '../../../../../services/materials';
import MaterialItem from '../../../../../components/teacher/materials/MaterialItem';
import CreateMaterialModal from '../../../../../components/teacher/materials/CreateMaterialModal';

export default function ClassDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState('materials');
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (activeTab === 'materials') {
            fetchMaterials();
        }
    }, [activeTab]);

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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Kelas</Text>
                <View style={{ width: 24 }} />
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
                                    <MaterialItem
                                        item={item}
                                        onDelete={handleDeleteMaterial}
                                    // onEdit={handleEditMaterial} // Future implementation
                                    />
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
                    <View style={{ padding: 20 }}>
                        <Text>Informasi Kelas features coming soon...</Text>
                    </View>
                )}

                {activeTab === 'students' && (
                    <View style={{ padding: 20 }}>
                        <Text>Daftar Siswa features coming soon...</Text>
                    </View>
                )}
            </View>

            <CreateMaterialModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleCreateMaterial}
            />
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
});
