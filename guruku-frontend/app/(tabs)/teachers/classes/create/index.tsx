import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { createClass } from '../../../../../services/classes';
import { SafeAreaView } from 'react-native-safe-area-context';

const GRADES = ["7 SMP", "8 SMP", "9 SMP", "10 SMA", "11 SMA", "12 SMA"];

export default function CreateClass() {
    const router = useRouter();
    const [namaKelas, setNamaKelas] = useState("");
    const [description, setDescription] = useState("");
    const [grade, setGrade] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const handleCreate = async () => {
        if (!namaKelas || !grade) {
            Alert.alert("Error", "Nama Kelas dan Jenjang Kelas wajib diisi");
            return;
        }

        try {
            setIsSubmitting(true);
            await createClass({
                name: namaKelas,
                description: description,
                grade: grade
            });
            Alert.alert("Sukses", "Kelas berhasil dibuat", [
                {
                    text: "OK",
                    onPress: () => router.replace('/(tabs)/teachers/classes')
                }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Gagal membuat kelas. Silakan coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0B409C', marginBottom: 20 }}>
                    Buat Kelas Baru
                </Text>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Nama Kelas <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        value={namaKelas}
                        onChangeText={setNamaKelas}
                        placeholder="Contoh: Matematika X-A"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Jenjang (Grade) <Text style={styles.required}>*</Text></Text>
                    <TouchableOpacity
                        style={[styles.input, styles.pickerButton]}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={{ color: grade ? '#333' : '#999' }}>
                            {grade || "Pilih Jenjang Kelas"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Deskripsi (Opsional)</Text>
                    <TextInput
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Deskripsi singkat tentang kelas ini..."
                        placeholderTextColor="#999"
                        multiline
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                    onPress={handleCreate}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Buat Kelas</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Modal Pilih Grade */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Pilih Jenjang Kelas</Text>
                        <ScrollView>
                            {GRADES.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setGrade(item);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalCloseText}>Batal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    required: {
        color: 'red',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#F9F9F9',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        color: '#333',
    },
    pickerButton: {
        justifyContent: 'center',
    },
    submitButton: {
        backgroundColor: '#0B409C',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    disabledButton: {
        backgroundColor: '#A0A0A0',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '50%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#0B409C',
    },
    modalItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalItemText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    modalCloseButton: {
        marginTop: 15,
        paddingVertical: 10,
        alignItems: 'center',
    },
    modalCloseText: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

