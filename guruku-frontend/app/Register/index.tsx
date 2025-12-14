import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Alert, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import API_BASE_URL from "@/config/api";
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function App() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState(""); // format: YYYY-MM-DD
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [role, setRole] = useState("student");
  
  // PERBAIKAN 1: Menambahkan state untuk mengontrol visibilitas dropdown
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date());

  // Format tanggal ke YYYY-MM-DD
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setBirthDate(formatDate(selectedDate));
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password: string) => {
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleRegister = async () => {
    if (!fullName || !birthDate || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Semua field wajib diisi");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Format email tidak valid");
      return;
    }

    if (!isValidPassword(password)) {
      Alert.alert(
        "Error",
        "Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Password dan Konfirmasi Password tidak cocok");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/users/register/`, {
        full_name: fullName,
        birth_date: birthDate,
        email: email,
        password: password,
        role: role
      });

      Alert.alert("Sukses", "Registrasi berhasil!", [
        { text: "OK", onPress: () => router.replace("Login") }
      ]);

    } catch (error: any) {
      console.log("Registration Error:", error.response?.data);
      if (error.response?.status === 400 && error.response?.data?.email) {
        Alert.alert("Gagal", "Email sudah terdaftar. Gunakan email lain.");
      } else {
        Alert.alert("Gagal", "Registrasi gagal. Periksa koneksi atau data kembali.");
      }
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.BGHeader02} />
      <View style={styles.BGHeader01} />

      {/* Main Header */}
      <View style={styles.MainHeader}>
        <Text style={styles.HeaderContent}>Sudah Mempunyai Akun?</Text>
        <TouchableOpacity onPress={() => router.push("Login")} >
          <Text style={styles.TextLogButton}>Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentBox}>
        <View style={styles.FormBox}>
          <View style={styles.InputBox}>
            <Text style={styles.labelInput}>Masukan Nama Lengkap</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor="#aaa"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.InputBox}>
            <Text style={styles.labelInput}>Tanggal Lahir</Text>

            <Pressable onPress={() => setShowPicker(true)}>
              <Text style={[styles.input, { paddingVertical: 8 }]}>
                {birthDate || "Pilih tanggal lahir"}
              </Text>
            </Pressable>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onChangeDate}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.InputBox}>
            <Text style={styles.labelInput}>Role</Text>

            <View style={{ position: 'relative', zIndex: 2000 }}>
              <Pressable
                style={styles.dropdownInput}
                onPress={() => setShowRoleDropdown(!showRoleDropdown)}
              >
                <Text style={styles.dropdownText}>
                  {role === "student" ? "Student" : "Teacher"}
                </Text>
                <Ionicons
                  name={showRoleDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                />
              </Pressable>

              {showRoleDropdown && (
                <View style={styles.dropdownMenu}>
                  <Pressable
                    style={styles.dropdownItem}
                    onPress={() => {
                      setRole("student");
                      setShowRoleDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>Student</Text>
                  </Pressable>

                  <Pressable
                    style={styles.dropdownItem}
                    onPress={() => {
                      setRole("teacher");
                      setShowRoleDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>Teacher</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          <View style={styles.InputBox}>
            <Text style={styles.labelInput}>Email</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.InputBox}>
            <Text style={styles.labelInput}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="gray" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.InputBox}>
            <Text style={styles.labelInput}>Konfirmasi Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#aaa"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={24} color="gray" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.InputBox}>
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Image
                style={{ width: 30, height: 30 }}
                source={require('../../assets/images/arrow-right.png')}
              />
            </TouchableOpacity>
          </View>

        </View>
      </View>

      {/* Footer Background */}
      <View style={styles.BGFooter02} />
      <View style={styles.BGFooter01} />

      {/* Main Footer */}
      <View style={styles.MainFooter}>
        <Text style={styles.FooterContent}>REGISTER</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // HEADER SECTION
  MainHeader: {
    width: '70%',
    position: 'absolute',
    zIndex: 10,
    top: 50,
    elevation: 100
  },

  HeaderContent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },

  TextLogButton: {
    fontSize: 12,
    color: 'blue',
  },

  BGHeader01: {
    width: '105%',
    height: 140,
    borderRadius: 12,
    backgroundColor: 'white',
    position: 'absolute',
    transform: [{ rotate: '-6deg' }],
    top: -40,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
  },

  BGHeader02: {
    width: 140,
    height: 140,
    borderRadius: 16,
    backgroundColor: '#0B409C',
    position: 'absolute',
    top: -20,
    right: '1%',
    zIndex: 1,
  },

  // FOOTER SECTION
  MainFooter: {
    width: '70%',
    position: 'absolute',
    zIndex: 10,
    bottom: 50,
    elevation: 100,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  FooterContent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B409C',
  },

  BGFooter01: {
    width: '105%',
    height: 140,
    borderRadius: 12,
    backgroundColor: 'white',
    position: 'absolute',
    transform: [{ rotate: '-6deg' }],
    bottom: -40,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
  },

  BGFooter02: {
    width: 140,
    height: 140,
    borderRadius: 16,
    backgroundColor: '#0B409C',
    position: 'absolute',
    bottom: -20,
    left: '1%',
    zIndex: 1,
  },

  // CONTENT SECTION
  contentBox: {
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: '20%',
    width: '100%',
  },

  FormBox: {
    width: '70%',
  },

  InputBox: {
    marginVertical: 12,
  },

  labelInput: {
    fontSize: 12,
  },

  input: {
    fontSize: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },

  // PERBAIKAN 2: Menambahkan style untuk dropdown yang hilang
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    paddingVertical: 8,
  },

  dropdownText: {
    fontSize: 16,
    color: 'black',
  },

  dropdownMenu: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#0B409C',
    borderRadius: 8,
    zIndex: 999,
    elevation: 10,
  },

  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  dropdownItemText: {
    fontSize: 16,
    color: '#0B409C',
    fontWeight: 'bold',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    justifyContent: 'space-between',
  },
  
  passwordInput: {
    fontSize: 16,
    paddingVertical: 6,
    flex: 1,
  },

  button: {
    width: 52,
    height: 52,
    backgroundColor: '#0B409C',
    borderRadius: 100,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
});