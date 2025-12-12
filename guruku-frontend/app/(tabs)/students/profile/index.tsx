import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from 'expo-image-picker';
import BottomNav from "../../../../components/BottomNav";
import { fetchUserProfile, updateUserProfile } from "../../../../services/user";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from "../../../../config/api";

const StudentProfile: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [nisn, setNisn] = useState("");
  const [grade, setGrade] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchUserProfile();
      setUser(data);
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const openEditModal = () => {
    if (user) {
      setFullName(user.full_name || "");
      setNisn(user.nisn || "");
      setGrade(user.grade || "");
      setProfileImage(user.profile_picture || null);
      setModalVisible(true);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("full_name", fullName);
      if (nisn) formData.append("nisn", nisn);
      if (grade) formData.append("grade", grade);

      if (profileImage && profileImage !== user?.profile_picture) {
        // @ts-ignore
        formData.append("profile_picture", {
          uri: profileImage,
          name: `profile_${Date.now()}.jpg`,
          type: "image/jpeg",
        });
      }

      await updateUserProfile(formData);
      Alert.alert("Sukses", "Profil berhasil diperbarui!");
      setModalVisible(false);
      loadProfile();
    } catch (error) {
      console.error("Update failed", error);
      Alert.alert("Gagal", "Gagal memperbarui profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('userRole');
      router.replace('/Login');
    } catch (e) {
      console.error(e);
    }
  }

  if (loading && !user) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0B409C" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* --- Header Section --- */}
        <LinearGradient
          colors={["#005DFF", "#0B409C"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.headerContainer}
        >
          <View style={styles.profileInfo}>
            <TouchableOpacity onPress={openEditModal}>
              <View style={[
                styles.avatarContainer,
                user?.is_verified ? { borderColor: '#4CAF50' } : { borderColor: '#FFC107' }
              ]}>
                <Image
                  source={{
                    uri: user?.profile_picture
                      ? (user.profile_picture.startsWith('http')
                        ? user.profile_picture
                        : `${API_BASE_URL.replace('/api', '')}${user.profile_picture}`) + `?t=${new Date().getTime()}`
                      : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                  }}
                  style={styles.avatarImage}
                />
                {!user?.profile_picture && (
                  <View style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.3)', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 10 }}>Tap to Edit</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <Text style={styles.userName}>{user?.full_name || "User"}</Text>

            {/* Verification Badge */}
            <View style={[
              styles.badge,
              { backgroundColor: user?.is_verified ? '#d4edda' : '#fff3cd' }
            ]}>
              <Text style={[
                styles.badgeText,
                { color: user?.is_verified ? '#155724' : '#856404' }
              ]}>
                {user?.is_verified ? "✅ Terverifikasi" : "⚠️ Belum Terverifikasi"}
              </Text>
            </View>
            {!user?.is_verified && (
              <Text style={styles.verifyHint}>
                Lengkapi NISN & Grade untuk verifikasi
              </Text>
            )}


            <TouchableOpacity style={styles.editProfileButton} onPress={openEditModal}>
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* --- MENU SECTION --- */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NISN</Text>
            <Text style={styles.infoValue}>{user?.nisn || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kelas (Grade)</Text>
            <Text style={styles.infoValue}>{user?.grade || "-"}</Text>
          </View>
        </View>

        <View style={styles.bodyContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert("Pusat Bantuan", "Hubungi admin@guruku.ai")}
          >
            <Text style={styles.actionButtonText}>Pusat Bantuan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.actionButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profil</Text>

            <TouchableOpacity onPress={pickImage} style={styles.modalImageWrapper}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.modalImage} />
              ) : (
                <View style={styles.modalImagePlaceholder}><Text>Pilih Foto</Text></View>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>NISN</Text>
            <TextInput
              style={styles.input}
              value={nisn}
              onChangeText={setNisn}
              keyboardType="numeric"
              placeholder="Nomor Induk Siswa Nasional"
            />

            <Text style={styles.label}>Kelas (Grade)</Text>
            <TextInput
              style={styles.input}
              value={grade}
              onChangeText={setGrade}
              placeholder="Contoh: 10, 11, 12"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSave]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Simpan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNav activeTab="profile" />
    </View>
  );
};

export default StudentProfile;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    backgroundColor: '#004aad',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'white'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  verifyHint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 15,
    fontStyle: 'italic'
  },
  editProfileButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  editProfileText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
  },

  infoSection: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    color: '#666',
    fontSize: 14,
  },
  infoValue: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },

  bodyContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#154ca1',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: '#d9534f',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalImageWrapper: {
    alignSelf: 'center',
    marginBottom: 15,
  },
  modalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  modalImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  btnCancel: {
    backgroundColor: '#ccc',
  },
  btnSave: {
    backgroundColor: '#0B409C',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
