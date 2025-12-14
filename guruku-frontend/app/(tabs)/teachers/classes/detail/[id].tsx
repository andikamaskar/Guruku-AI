import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SuccessModal from '../../../../../components/modals/SuccessModal';

export default function ClassDetail() {
    const router = useRouter();
    // 'id' here corresponds to the [id] filename, which we are using as namaKelas for now
    const { id } = useLocalSearchParams();
    const [info, setInfo] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handlePostingTugas = async () => {
        if (info.trim() === '') {
            alert('Masukkan informasi terlebih dahulu!');
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setShowSuccessModal(true);
            setInfo('');
        } catch {
            alert('Gagal posting informasi. Coba lagi!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
            <View style={{ padding: 20 }}>
                {/* Header / Detail Section */}
                <View style={{ backgroundColor: '#0A4D9F', padding: 15, borderRadius: 10, marginBottom: 20 }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
                        {id} {/* Displaying Class Name */}
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
                        <Text style={{ color: '#E0E0E0' }}>Kode Kelas: </Text>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>xbn29lk</Text>
                    </View>
                </View>

                {/* Post Information Section */}
                <View style={{
                    backgroundColor: '#fff',
                    borderWidth: 1,
                    borderColor: '#ddd',
                    padding: 15,
                    borderRadius: 10,
                    elevation: 2
                }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10, color: '#333' }}>
                        Bagikan Informasi
                    </Text>

                    <TextInput
                        style={styles.input}
                        multiline
                        placeholder="Masukkan pengumuman atau informasi untuk kelas..."
                        value={info}
                        onChangeText={setInfo}
                        editable={!isLoading}
                    />

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handlePostingTugas}
                        disabled={isLoading}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? '⏳ Posting...' : 'Posting'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <SuccessModal
                visible={showSuccessModal}
                title="Berhasil!"
                message="Informasi telah berhasil diposting ke kelas."
                buttonText="Tutup"
                onClose={handleCloseModal}
                showSecondaryButton={false}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    input: {
        height: 120,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: '#ccc',
        padding: 12,
        textAlignVertical: 'top', // Android
        fontSize: 14,
        backgroundColor: '#FAFAFA'
    },
    button: {
        backgroundColor: '#0A4D9F',
        padding: 12,
        marginTop: 15,
        borderRadius: 8,
        alignItems: 'center'
    },
    buttonDisabled: {
        backgroundColor: '#5C8BC0',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
});
