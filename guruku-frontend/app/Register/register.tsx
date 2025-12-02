import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Alert, Platform, Pressable } from 'react-native';
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

  const [role, setRole] = useState("student");

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
    if (!fullName || !birthDate || !email || !password) {
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

    try {
      const res = await axios.post(`${API_BASE_URL}/users/register/`, {
        full_name: fullName,
        birth_date: birthDate,
        email: email,
        password: password,
        role: role
      });

      Alert.alert("Sukses", "Registrasi berhasil!", [
        { text: "OK", onPress: () => router.push("Login/login") }
      ]);

    } catch (error: any) {
      console.log(error.response?.data);
      Alert.alert("Gagal", "Registrasi gagal. Periksa data kembali.");
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.BGHeader02} />
      <View style={styles.BGHeader01} />

      {/* Main Header */}
      <View style={styles.MainHeader}>
        <Text style={styles.HeaderContent}>Sudah Mempunyai Akun?</Text>
        <TouchableOpacity style={styles.TextLogButton} onPress={() => router.push("Login/login")} >
          <Text style={styles.TextLogButton}>Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentBox}>
        <View style={styles.FormBox}>

          {/* Role Selection */}
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === "student" && styles.roleButtonActive]}
              onPress={() => setRole("student")}
            >
              <Text style={[styles.roleText, role === "student" && styles.roleTextActive]}>Student</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === "teacher" && styles.roleButtonActive]}
              onPress={() => setRole("teacher")}
            >
              <Text style={[styles.roleText, role === "teacher" && styles.roleTextActive]}>Teacher</Text>
            </TouchableOpacity>
          </View>

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
                maximumDate={new Date()} // tidak bisa pilih tanggal masa depan
              />
            )}
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
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.InputBox}>
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Image
                style={{ width: 30, height: 30 }}
                source={require('../../assets/images/arrow-right.png')}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.InputBox}>
            <Text style={styles.orText}> - or -</Text>
          </View>

          <View style={styles.InputBox}>
            <TouchableOpacity style={styles.Gbutton}>
              <Text style={styles.TextGButton}>Masuk menggunakan Google</Text>
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

  forgetpassword: {
    fontSize: 12,
    textAlign: 'end',
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

  orText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
  },

  Gbutton: {
    backgroundColor: '#0B409C',
    borderRadius: 8,
    paddingVertical: 10,
  },

  TextGButton: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
  },

  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#0B409C',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: 'white',
  },
  roleButtonActive: {
    backgroundColor: '#0B409C',
  },
  roleText: {
    color: '#0B409C',
    fontWeight: 'bold',
  },
  roleTextActive: {
    color: 'white',
  },
});
