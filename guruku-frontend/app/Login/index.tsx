import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { login } from '../../services/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi.");
      return;
    }

    try {
      const data = await login(email, password);

      console.log("Login Response:", data);

      const role = data.user.role;

      Alert.alert("Success", "Login berhasil!");

      // Arahkan berdasar role
      if (role === "student") {
        router.replace("/(tabs)/students");
      }
      else if (role === "teacher") {
        router.replace("/(tabs)/teachers");
      }
      else {
        Alert.alert("Error", "Role tidak dikenali!");
      }
      await AsyncStorage.setItem("role", role);
    } catch (error: any) {
      console.log(error.response?.data);
      Alert.alert("Login gagal", error.response?.data?.error || "Terjadi kesalahan");
    }
  };


  return (
    <View style={styles.container}>

      <View style={styles.BGHeader02} />
      <View style={styles.BGHeader01} />

      {/* Main Header */}
      <View style={styles.MainHeader}>
        <Text style={styles.HeaderContent}>LOGIN</Text>
      </View>

      <View style={styles.contentBox}>
        <View style={styles.FormBox}>

          <Image
            style={styles.MainImage as any}
            source={require('../../assets/images/login-img.png')}
          />

          <View style={styles.InputBox}>
            <Text style={styles.labelInput}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
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
            <Text style={styles.forgetpassword} />
          </View>

          <View style={styles.InputBox}>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
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

          <View style={styles.InputBox}>
            <TouchableOpacity style={styles.classButton} onPress={() => router.push("/(tabs)/students/StudenClass")}>
              <Text style={styles.classButtonText}>Masuk ke Student Class</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.InputBox}>
            <TouchableOpacity style={styles.classButton} onPress={() => router.push("/(tabs)/students/StudenQuizz")}>
              <Text style={styles.classButtonText}>Masuk ke Student Quizz</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.InputBox}>
            <TouchableOpacity style={styles.classButton} onPress={() => router.push("/(tabs)/students/StudenProfile")}>
              <Text style={styles.classButtonText}>Masuk ke Student Profile</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>

      {/* Footer Background */}
      <View style={styles.BGFooter02} />
      <View style={styles.BGFooter01} />

      {/* Main Footer */}
      <View style={styles.MainFooter}>
        <View>
          <Text style={styles.FooterContent}>Pengguna Baru?</Text>
          <TouchableOpacity style={styles.regbutton} onPress={() => router.push("/Register")}>
            <Text style={styles.TextRegButton}>Register</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B409C',
  },

  TextRegButton: {
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
    bottom: 40,
    elevation: 100,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },


  FooterContent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
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

  MainImage: {
    width: 240,
    height: 126,
    alignSelf: 'center',
    marginBottom: 20
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
    textAlign: 'right',
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
  regbutton: {
    marginLeft: 5,
  },

  classButton: {
    backgroundColor: "#1E88E5",
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 10,
  },

  classButtonText: {
    textAlign: "center",
    color: "white",
    fontSize: 14,
    fontWeight: "bold"
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

});
