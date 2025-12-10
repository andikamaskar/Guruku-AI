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
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ganti dengan URL API Anda yang sesuai
const API_URL = 'https://digressive-unfacilely-dorla.ngrok-free.dev/api';

interface Material {
  id: string;
  title: string;
  created_at: string;
  is_completed: boolean;
}

export default function DetailClassScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const classId = params.classId as string;
  const className = params.className as string || "Detail Kelas";

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, [classId]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/materials/class/${classId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(response.data);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Material }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({
        pathname: "/(tabs)/students/classes/DetailClass/MaterialDetail",
        params: { materialId: item.id, title: item.title }
      })}
    >
      <View style={styles.cardContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDate}>
            {new Date(item.created_at).toLocaleDateString('id-ID', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </Text>
        </View>
        {item.is_completed && (
          <Ionicons name="checkmark-circle" size={24} color="#4ADE80" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B409C" />
      <Stack.Screen options={{ headerShown: false }} />

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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  backButtonTouchable: { marginRight: 15 },
  backButton: {
    padding: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDate: { color: '#DBEAFE', fontSize: 12 },
});