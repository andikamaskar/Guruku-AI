import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import SuccessModal from '../../../components/modals/SuccessModal';

type RootStackParamList = {
  InformasiKelas: undefined;
  BuatKelas: undefined;
  Dashboard: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'InformasiKelas'>;

export default function InformasiKelas({ navigation }: Props) {
  const [info, setInfo] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePostingTugas = async () => {
    if (info.trim() === '') {
      alert('Masukkan informasi terlebih dahulu!');
      return;
    }

    setIsLoading(true);
    
    // Simulasi API call (ganti dengan API real Anda)
    try {
      // await api.postInformasiKelas(info);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowSuccessModal(true);
      setInfo(''); // Clear input setelah posting
    } catch {
      alert('Gagal posting informasi. Coba lagi!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKembali = () => {
    setShowSuccessModal(false);
    navigation.navigate('Dashboard');
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ backgroundColor: '#0A4D9F', padding: 10, borderRadius: 10 }}>
        <Text style={{ color: '#fff', fontSize: 16 }}>Mobile Programming</Text>
      </View>

      <View
        style={{
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#0A4D9F',
          marginTop: 20,
          padding: 10,
          borderRadius: 10,
        }}
      >
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Informasi</Text>

        <TextInput
          style={styles.input}
          multiline
          placeholder="Masukkan informasi untuk kelas..."
          value={info}
          onChangeText={setInfo}
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[
            styles.button,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handlePostingTugas}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '⏳ Posting...' : 'Posting'}
          </Text>
        </TouchableOpacity>
      </View>

      <SuccessModal
        visible={showSuccessModal}
        title="Berhasil!"
        message="Informasi tugas telah berhasil diposting ke kelas."
        buttonText="Kembali"
        onClose={handleKembali}
        showSecondaryButton={true}
        secondaryButtonText="Tutup"
        onSecondaryPress={() => setShowSuccessModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 120,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ccc',
    padding: 10,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#0A4D9F',
    padding: 10,
    marginTop: 15,
    borderRadius: 5,
  },
  buttonDisabled: {
    backgroundColor: '#0A4D9F',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
