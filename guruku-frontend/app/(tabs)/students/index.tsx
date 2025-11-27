import { View, Text, StyleSheet } from "react-native";

export default function StudentDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard Siswa</Text>
      <Text style={styles.subtitle}>Selamat datang di beranda siswa 👋</Text>
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
