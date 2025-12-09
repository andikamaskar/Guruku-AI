import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function JoinClass() {
  const router = useRouter();
  const [classCode, setClassCode] = useState("");

  const handleJoin = async () => {
    if (!classCode.trim()) {
      Alert.alert("Error", "Kode kelas tidak boleh kosong");
      return;
    }

    try {
      // fetch ke backend
      const res = await fetch("https://your-backend.com/api/join-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: classCode })
      });

      const data = await res.json();

      if (data.success) {
        // navigasi ke daftar tugas pada folder JoinKelas
        router.push("/JoinKelas/ListTugas");
      } else {
        Alert.alert("Gagal", data.message || "Kode kelas salah");
      }
    } catch {
      Alert.alert("Error", "Terjadi kesalahan pada server");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mintalah kode kelas kepada pengajar, lalu masukan kodenya di sini.</Text>

      <TextInput
        style={styles.input}
        placeholder="*********"
        value={classCode}
        onChangeText={setClassCode}
      />

      <TouchableOpacity style={styles.button} onPress={handleJoin}>
        <Text style={styles.buttonText}>Gabung Kelas</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40
  },
  input: {
    borderWidth: 1,
    borderColor: "#1E56A0",
    borderRadius: 12,
    padding: 15,
    fontSize: 20,
    textAlign: "center",
    marginBottom: 30
  },
  button: {
    backgroundColor: "#063A9C",
    paddingVertical: 15,
    borderRadius: 12
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center"
  }
});
