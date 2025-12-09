import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BottomNav from "../../../../components/BottomNav";

// --- Tipe Props BOTTOM NAV --- //
interface BottomNavProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
}

const StudentProfile: React.FC = () => {
  const handlePress = (menu: string) => {
    console.log(`Tombol ${menu} ditekan`);
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- Header Section --- */}
        <LinearGradient
          colors={["#005DFF", "#0B409C"]} // atas → bawah
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.headerContainer}
        >
          <View style={styles.profileInfo}>
            {/* FOTO PROFILE */}
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                }}
                style={styles.avatarImage}
              />
            </View>

            <Text style={styles.userName}>My Account</Text>

            <TouchableOpacity style={styles.editProfileButton}>
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* --- MENU SECTION --- */}
        <View style={styles.bodyContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handlePress("Pusat Bantuan")}
          >
            <Text style={styles.actionButtonText}>Pusat Bantuan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handlePress("Pengaturan Privasi")}
          >
            <Text style={styles.actionButtonText}>Pengaturan Privasi</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => handlePress("Log Out")}
          >
            <Text style={styles.actionButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <BottomNav activeTab="profile" />
    </View>
  );
};

export default StudentProfile;

// --- STYLES --- //
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
  headerTitle: {
    color: 'white',
    fontSize: 16,
    position: 'absolute',
    top: 50,
    left: 20,
    opacity: 0.8,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  // 3. Style Container tetap sama (lingkaran putih pembungkus)
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60, // Setengah dari width/height agar bulat sempurna
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden', // Penting agar gambar tidak keluar dari lingkaran
    borderWidth: 4,     // Opsional: memberi border putih di sekeliling foto
    borderColor: 'white'
  },
  // 4. Style baru untuk Image
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Agar gambar memenuhi lingkaran
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  editProfileButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 80,
    borderRadius: 25,
  },
  editProfileText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bodyContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#154ca1',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: 'red',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
