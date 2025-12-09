import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type DetailKelasParams = {
  namaKelas: string;
};

type RootStackParamList = {
  Dashboard: undefined;
  BuatKelas: undefined;
  DetailKelas: DetailKelasParams;
  InformasiKelas: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function Dashboard({ navigation }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ height: 160, backgroundColor: '#0A4D9F', padding: 20 }}>
        <Text style={{ color: '#fff', marginTop: 30, fontSize: 22, fontWeight: 'bold' }}>
          Dashboard Guru
        </Text>

        <TouchableOpacity
          style={{
            marginTop: 25,
            backgroundColor: '#FFB100',
            padding: 10,
            borderRadius: 5,
            alignSelf: 'flex-start',
          }}
          onPress={() => navigation.navigate('BuatKelas')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Buat Kelas Baru</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
