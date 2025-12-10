import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  StatusBar, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

// Tipe data materi (sesuaikan dengan API Anda nanti)
interface Material {
  id: string;
  title: string;
  date: string;
}

// Data Dummy Sementara
const DUMMY_MATERIALS: Record<string, Material[]> = {
  "1": [
    { id: 'm1', title: 'Pertemuan 1 - Pengenalan', date: 'Senin, 15 Juli 2024' },
    { id: 'm2', title: 'Pertemuan 2 - Logika Dasar', date: 'Senin, 22 Juli 2024' },
  ],
  "2": [
    { id: 'm1', title: 'Bab 1 - Aljabar', date: 'Selasa, 16 Juli 2024' },
  ]
};

export default function DetailClassScreen() {
  const router = useRouter();
  
  // Menangkap parameter yang dikirim
  const params = useLocalSearchParams();
  const classId = params.classId as string;
  const className = params.className as string || "Detail Kelas";

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulasi loading data
    console.log("Membuka kelas ID:", classId);
    setLoading(true);
    
    // Nanti ganti ini dengan fetch API ke backend Anda
    setTimeout(() => {
      const data = DUMMY_MATERIALS[classId] || [];
      setMaterials(data);
      setLoading(false);
    }, 500);
  }, [classId]);

  const renderItem = ({ item }: { item: Material }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDate}>{item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B409C" />
      
      {/* Sembunyikan header default Expo */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER CUSTOM */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonTouchable}>
          <View style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {className}
        </Text>
      </View>

      {/* KONTEN */}
      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#0B409C" />
          </View>
        ) : materials.length > 0 ? (
          <FlatList
            data={materials}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPadding}
          />
        ) : (
          <View style={styles.centerState}>
            <Ionicons name="folder-open-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Belum ada materi di kelas ini.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    backgroundColor: '#0B409C',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
  },
  backButtonTouchable: { marginRight: 15 },
  backButton: {
    padding: 5,
    borderRadius: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  contentContainer: { flex: 1, backgroundColor: '#F5F6FA' },
  listPadding: { padding: 20 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#888', marginTop: 10, fontSize: 14 },
  card: {
    backgroundColor: '#0B409C',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 4,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDate: { color: '#DBEAFE', fontSize: 12 },
});