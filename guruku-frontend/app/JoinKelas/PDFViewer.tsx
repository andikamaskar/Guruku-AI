import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PDFViewer() {
  const router = useRouter();
  const { title, url } = useLocalSearchParams();

  const handleDownloadOrOpen = async () => {
    try {
      const supported = await Linking.canOpenURL(url as string);
      if (supported) {
        await Linking.openURL(url as string);
      } else {
        Alert.alert("Error", "Tidak bisa membuka PDF dengan device Anda");
      }
    } catch {
      Alert.alert("Error", "Gagal membuka PDF. Pastikan URL valid dan koneksi internet stabil");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title || "PDF Viewer"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.previewContainer}>
          <Ionicons name="document-text" size={80} color="#0A4DAB" style={{ marginBottom: 20 }} />
          <Text style={styles.fileTitle}>{title || "PDF File"}</Text>
          <Text style={styles.fileInfo}>PDF Document</Text>
          <Text style={styles.urlText} numberOfLines={2}>{url}</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Preview PDF</Text>
            <Text style={styles.infoText}>
              Aplikasi tidak mendukung preview PDF secara inline. Tekan tombol {`"Buka PDF"`} untuk membuka dengan aplikasi PDF reader di device Anda.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleDownloadOrOpen}>
          <Ionicons name="download" size={20} color="white" style={{ marginRight: 10 }} />
          <Text style={styles.buttonText}>Buka PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#0A4DAB",
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginHorizontal: 10,
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  previewContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
  },
  fileTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#063A9C",
    marginBottom: 8,
    textAlign: "center",
  },
  fileInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  urlText: {
    fontSize: 11,
    color: "#999",
    marginBottom: 20,
    fontFamily: "monospace",
    textAlign: "center",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    width: "100%",
  },
  infoBox: {
    backgroundColor: "#E8F0FE",
    borderLeftWidth: 4,
    borderLeftColor: "#0A4DAB",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0A4DAB",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  footer: {
    padding: 15,
    backgroundColor: "white",
    elevation: 3,
  },
  actionButton: {
    backgroundColor: "#0A4DAB",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
