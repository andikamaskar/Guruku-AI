import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type DetailKelasParams = {
  namaKelas: string;
};

type RootStackParamList = {
  DetailKelas: DetailKelasParams;
  InformasiKelas: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'DetailKelas'>;

export default function DetailKelas({ route, navigation }: Props) {
  const { namaKelas } = route.params;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ backgroundColor: '#0A4D9F', padding: 15, borderRadius: 10 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
          {namaKelas}
        </Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: 'bold' }}>Kode Kelas</Text>
        <Text style={{ paddingVertical: 5 }}>xbn29lk</Text>

        <TouchableOpacity
          style={{
            backgroundColor: '#0A4D9F',
            padding: 8,
            borderRadius: 5,
            marginTop: 10,
            width: 110,
          }}
          onPress={() => navigation.navigate('InformasiKelas')}
        >
          <Text style={{ color: '#fff', textAlign: 'center' }}>+ Informasi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
