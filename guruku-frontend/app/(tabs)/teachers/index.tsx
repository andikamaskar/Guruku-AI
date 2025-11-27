import { View, Text, StyleSheet } from "react-native";

export default function TeacherDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard Guru</Text>
      <Text style={styles.subtitle}>Halo, Guru! Kelola kelas Anda di sini 📚</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0B409C"
  },
  subtitle: {
    fontSize: 16,
    marginTop: 10,
    color: "#666"
  }
});
