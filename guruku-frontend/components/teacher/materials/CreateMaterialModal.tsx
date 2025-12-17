import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { generateContentFromFile } from '../../../services/materials';

interface CreateMaterialModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

export default function CreateMaterialModal({ visible, onClose, onSave }: CreateMaterialModalProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [video, setVideo] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'manual' | 'generate'>('manual');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handlePickVideo = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
            if (!result.canceled) {
                setVideo(result.assets[0]);
            }
        } catch (err) {
            Alert.alert("Error", "Gagal memilih video");
        }
    };

    const handleGenerateContent = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
            });

            if (result.canceled) return;

            setIsGenerating(true);
            const file = result.assets[0];

            // Call API to generate content
            const response = await generateContentFromFile(file);
            if (response.content) {
                setContent(response.content);
                Alert.alert("Sukses", "Konten berhasil dibuat dari dokumen! Silakan review dan edit sebelum menyimpan.");
                setActiveTab('manual'); // Switch to manual tab to let user review/edit
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Gagal membuat konten dari dokumen.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async () => {
        if (!title || !content) {
            Alert.alert("Error", "Judul dan Konten wajib diisi. Silakan ketik manual atau generate dari dokumen.");
            return;
        }

        try {
            setIsSaving(true);
            await onSave({ title, content, video });
            // Reset form
            setTitle("");
            setContent("");
            setVideo(null);
            onClose();
        } catch (error) {
            Alert.alert("Error", "Gagal menyimpan materi.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Buat Materi Baru</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Judul Materi</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Contoh: Pengenalan Aljabar"
                        />
                    </View>

                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'manual' && styles.activeTab]}
                            onPress={() => setActiveTab('manual')}
                        >
                            <Text style={[styles.tabText, activeTab === 'manual' && styles.activeTabText]}>Input Manual</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'generate' && styles.activeTab]}
                            onPress={() => setActiveTab('generate')}
                        >
                            <Text style={[styles.tabText, activeTab === 'generate' && styles.activeTabText]}>Upload & Generate</Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'generate' ? (
                        <View style={styles.generateContainer}>
                            <Text style={styles.helperText}>
                                Upload dokumen (PDF/DOCX) untuk membuat konten materi secara otomatis menggunakan AI.
                            </Text>
                            <TouchableOpacity
                                style={styles.uploadButton}
                                onPress={handleGenerateContent}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <ActivityIndicator color="#fff" />
                                        <Text style={styles.uploadButtonText}>Sedang Memproses...</Text>
                                    </View>
                                ) : (
                                    <>
                                        <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                                        <Text style={styles.uploadButtonText}>Pilih Dokumen & Generate</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Konten (Markdown/LaTeX)</Text>
                            <TextInput
                                style={[styles.input, { height: 150, textAlignVertical: 'top' }]}
                                value={content}
                                onChangeText={setContent}
                                placeholder="Ketik konten materi di sini atau hasil generate akan muncul di sini..."
                                multiline
                            />
                        </View>
                    )}

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Video (Opsional)</Text>
                        <TouchableOpacity style={styles.fileButton} onPress={handlePickVideo}>
                            <Ionicons name="videocam-outline" size={20} color="#666" />
                            <Text style={{ marginLeft: 10, color: video ? '#0B409C' : '#666' }}>
                                {video ? video.name : "Pilih Video"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, (!content || isSaving) && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={!content || isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Simpan Materi</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
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
        maxHeight: '90%',
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
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#0B409C',
    },
    tabText: {
        fontSize: 16,
        color: '#999',
    },
    activeTabText: {
        color: '#0B409C',
        fontWeight: '600',
    },
    generateContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        marginBottom: 15,
    },
    helperText: {
        textAlign: 'center',
        color: '#666',
        marginBottom: 15,
    },
    uploadButton: {
        backgroundColor: '#0B409C',
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        gap: 10,
    },
    uploadButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    fileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#F9F9F9',
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
});
