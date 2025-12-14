import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function CreateClass() {
    const router = useRouter();
    const [namaKelas, setNamaKelas] = useState("");
    const [materi, setMateri] = useState("");
    const [tempat, setTempat] = useState("");

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0A4D9F' }}>
                    Buat Kelas
                </Text>

                <View style={{ marginTop: 20 }}>
                    <Text>Nama Kelas</Text>
                    <TextInput
                        style={styles.input}
                        value={namaKelas}
                        onChangeText={setNamaKelas}
                        placeholder="Contoh: Mobile Programming"
                    />

                    <Text style={{ marginTop: 10 }}>Materi</Text>
                    <TextInput
                        style={styles.input}
                        value={materi}
                        onChangeText={setMateri}
                        placeholder="Contoh: UI/UX Design"
                    />

                    <Text style={{ marginTop: 10 }}>Tempat</Text>
                    <TextInput
                        style={styles.input}
                        value={tempat}
                        onChangeText={setTempat}
                        placeholder="Contoh: XI MM2 / Google Meet"
                    />

                    <TouchableOpacity
                        style={{
                            alignSelf: 'flex-start',
                            backgroundColor: '#0A4D9F',
                            marginTop: 15,
                            paddingHorizontal: 30,
                            paddingVertical: 8,
                            borderRadius: 5,
                        }}
                        onPress={() => {
                            // Navigate to the detail page using the class name as ID for demo purposes
                            // In real app, we would get an ID from backend response
                            router.replace(`/(tabs)/teachers/classes/detail/${namaKelas}`);
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Buat</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        borderRadius: 5,
        marginTop: 5,
    },
});
