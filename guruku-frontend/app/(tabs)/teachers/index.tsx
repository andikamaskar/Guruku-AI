import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from '../teachers/Dashboard';
import BuatKelas from '../teachers/BuatKelas';
import DetailKelas from '../teachers/DetailKelas';
import InformasiKelas from '../teachers/InformasiKelas';

export type TeacherStackParamList = {
  Dashboard: undefined;
  BuatKelas: undefined;
  DetailKelas: { namaKelas: string };
  InformasiKelas: undefined;
};

const Stack = createNativeStackNavigator<TeacherStackParamList>();

export default function TeacherDashboard() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="BuatKelas" component={BuatKelas} />
      <Stack.Screen name="DetailKelas" component={DetailKelas} />
      <Stack.Screen name="InformasiKelas" component={InformasiKelas} />
    </Stack.Navigator>
  );
}
