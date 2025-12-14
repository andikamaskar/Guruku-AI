import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import BottomNav from '../../../components/BottomNav';
import { fetchUserProfile } from '../../../services/user';

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchUserProfile();
      setUser(data);
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const handleCreateClass = () => {
    if (!user?.is_verified) {
      Alert.alert("Belum Terverifikasi", "Anda harus melengkapi profil (NIP & Mapel) dan menunggu verifikasi admin untuk membuat kelas.");
      return;
    }
    router.push('/(tabs)/teachers/classes/create');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            Dashboard Guru
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/teachers/profile')}>
            <Text style={{ fontSize: 24 }}>👤</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.createButton, !user?.is_verified && styles.disabledButton]}
          onPress={() => {
            if (user?.is_verified) {
              router.push('/(tabs)/teachers/classes/create');
            } else {
              handleCreateClass(); // Re-use alert logic if needed, or just let the button be disabled/handled above
            }
          }}
        >
          <Text style={styles.createButtonText}>
            {user?.is_verified ? "+ Buat Kelas Baru" : "🔒 Verifikasi Akun Dahulu"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {!loading && user && !user.is_verified && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ Akun Anda belum terverifikasi. Silakan lengkapi profil Anda.
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/teachers/profile')}>
              <Text style={styles.linkText}>Ke Profil ➔</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={{ padding: 20 }}>Selamat datang di Dashboard Guru, {user?.full_name || 'Guru'}.</Text>
        {/* Add more dashboard content here */}
      </ScrollView>

      <BottomNav activeTab="home" role="teacher" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 180, // Increased height for better spacing
    backgroundColor: '#0A4D9F',
    padding: 20
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold'
  },
  createButton: {
    marginTop: 25,
    backgroundColor: '#FFB100',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
  },
  warningContainer: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#FF9800',
  },
  warningText: {
    color: '#E65100',
    fontWeight: 'bold',
  },
  linkText: {
    color: '#0A4D9F',
    marginTop: 5,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  content: {
    flex: 1
  }
});
