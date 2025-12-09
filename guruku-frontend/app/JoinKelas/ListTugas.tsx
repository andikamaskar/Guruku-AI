import React from "react";
import { Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function TaskListScreen() {
  const router = useRouter();

  const taskList = [
    { id: 1, title: "Pertemuan 1 - Pengenalan Informatika", date: "Senin, 15 Juli 20XX" },
    { id: 2, title: "Pertemuan 2 - Dekomposisi & Pola", date: "Senin, 15 Juli 20XX" },
    { id: 3, title: "Pertemuan 3 - Abstraksi & Algoritma", date: "Senin, 15 Juli 20XX" },
  ];

  return (
    <ScrollView style={styles.container}>
      {taskList.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() => router.push(`/JoinKelas/DetailTugas?id=${item.id}`)}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  card: {
    backgroundColor: "#0A4DAB",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: { color: "white", fontSize: 18, fontWeight: "bold" },
  date: { color: "#DAE6FF", marginTop: 8 },
});
