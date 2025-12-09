import React, { useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Linking } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function MaterialDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Contoh data tugas dengan berbagai materi
  const tasks: Record<string, { title: string; description: string; materials: any[] }> = {
    "1": {
      title: "Pertemuan 1 - Pengenalan Informatika",
      description: "Pelajari dasar-dasar informatika dan komputer",
      materials: [
        { id: 1, label: "Materi Pembelajaran", icon: "https://cdn-icons-png.flaticon.com/512/3143/3143615.png", type: "pdf", url: "https://example.com/materi1.pdf" },
        { id: 2, label: "Video Pembelajaran", icon: "https://cdn-icons-png.flaticon.com/512/3556/3556059.png", type: "video", url: "https://example.com/video1.mp4" },
        { id: 3, label: "LKPD Individu", icon: "https://cdn-icons-png.flaticon.com/512/337/337946.png", type: "pdf", url: "https://example.com/lkpd1.pdf" },
        { id: 4, label: "Kuis Interaktif", icon: "https://cdn-icons-png.flaticon.com/512/4436/4436481.png", type: "quiz", url: "https://example.com/quiz1" },
      ]
    },
    "2": {
      title: "Pertemuan 2 - Dekomposisi & Pola",
      description: "Memahami dekomposisi masalah dan pola dalam pemrograman",
      materials: [
        { id: 1, label: "Materi Pembelajaran", icon: "https://cdn-icons-png.flaticon.com/512/3143/3143615.png", type: "pdf", url: "https://example.com/materi2.pdf" },
        { id: 2, label: "Contoh Kode", icon: "https://cdn-icons-png.flaticon.com/512/1532/1532556.png", type: "code", url: "https://example.com/code2.zip" },
        { id: 3, label: "Video Pembelajaran", icon: "https://cdn-icons-png.flaticon.com/512/3556/3556059.png", type: "video", url: "https://example.com/video2.mp4" },
        { id: 4, label: "Bahan Ajar", icon: "https://cdn-icons-png.flaticon.com/512/3541/3541944.png", type: "pdf", url: "https://example.com/bahan2.pdf" },
      ]
    },
    "3": {
      title: "Pertemuan 3 - Abstraksi & Algoritma",
      description: "Mendalami konsep abstraksi dan algoritma dasar",
      materials: [
        { id: 1, label: "Materi Pembelajaran", icon: "https://cdn-icons-png.flaticon.com/512/3143/3143615.png", type: "pdf", url: "https://example.com/materi3.pdf" },
        { id: 2, label: "Video Tutorial", icon: "https://cdn-icons-png.flaticon.com/512/3556/3556059.png", type: "video", url: "https://example.com/video3.mp4" },
        { id: 3, label: "Latihan Soal", icon: "https://cdn-icons-png.flaticon.com/512/4436/4436481.png", type: "quiz", url: "https://example.com/soal3" },
        { id: 4, label: "Referensi Buku", icon: "https://cdn-icons-png.flaticon.com/512/3143/3143615.png", type: "pdf", url: "https://example.com/buku3.pdf" },
      ]
    },
  };

  const task = tasks[String(id)] || {
    title: "Tugas Tidak Ditemukan",
    description: "Tidak ada deskripsi.",
    materials: []
  };

  const handleMaterialPress = (material: any) => {
    setSelectedMaterial(material);
    setModalVisible(true);
  };

  const handleOpenMaterial = () => {
    if (!selectedMaterial) return;
    
    // Navigasi berdasarkan tipe materi
    setModalVisible(false);
    
    if (selectedMaterial.type === "pdf") {
      router.push({
        pathname: "/JoinKelas/PDFViewer",
        params: {
          title: selectedMaterial.label,
          url: selectedMaterial.url
        }
      });
    } else if (selectedMaterial.type === "video") {
      router.push({
        pathname: "/JoinKelas/VideoViewer",
        params: {
          title: selectedMaterial.label,
          url: selectedMaterial.url
        }
      });
    } else if (selectedMaterial.label.includes("LKPD") || selectedMaterial.type === "lkpd") {
      router.push({
        pathname: "/JoinKelas/LKPDViewer",
        params: {
          title: selectedMaterial.label,
          url: selectedMaterial.url
        }
      });
    } else {
      Alert.alert(
        "Info",
        `Tipe file "${selectedMaterial.type}" sedang dalam pengembangan. URL: ${selectedMaterial.url}`,
        [
          { text: "Tutup", style: "cancel" },
          {
            text: "Buka di Browser",
            onPress: () => {
              Linking.openURL(selectedMaterial.url).catch(() => {
                Alert.alert("Error", "Tidak bisa membuka URL");
              });
            }
          }
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header dengan tombol kembali */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>{'< '} Kembali</Text>
      </TouchableOpacity>

      {/* Judul dan Deskripsi Tugas */}
      <Text style={styles.header}>{task.title}</Text>
      <Text style={styles.description}>{task.description}</Text>

      {/* Daftar Materi */}
      <Text style={styles.materialsTitle}>Materi Pembelajaran</Text>
      <View style={styles.grid}>
        {task.materials.map((material: any) => (
          <TouchableOpacity
            key={material.id}
            style={styles.materialCard}
            onPress={() => handleMaterialPress(material)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Image
                source={{ uri: material.icon }}
                style={styles.icon}
              />
            </View>
            <Text style={styles.materialLabel}>{material.label}</Text>
            <View style={styles.typeTag}>
              <Text style={styles.typeText}>{material.type}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal Detail Materi */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {selectedMaterial && (
              <>
                <Image
                  source={{ uri: selectedMaterial.icon }}
                  style={styles.modalIcon}
                />
                <Text style={styles.modalTitle}>{selectedMaterial.label}</Text>
                <Text style={styles.modalType}>Tipe: {selectedMaterial.type.toUpperCase()}</Text>
                <Text style={styles.modalUrl}>URL: {selectedMaterial.url}</Text>

                <TouchableOpacity
                  style={styles.openButton}
                  onPress={handleOpenMaterial}
                >
                  <Text style={styles.openButtonText}>Buka Materi</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    color: "#0A4DAB",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#063A9C",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 25,
    lineHeight: 20,
  },
  materialsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#063A9C",
    marginBottom: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  materialCard: {
    width: "48%",
    backgroundColor: "#E8F0FE",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D0E1FF",
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0A4DAB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    width: 40,
    height: 40,
  },
  materialLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#063A9C",
    textAlign: "center",
    marginBottom: 8,
  },
  typeTag: {
    backgroundColor: "#0A4DAB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    minHeight: 400,
  },
  closeButton: {
    alignSelf: "flex-end",
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#333",
  },
  modalIcon: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#063A9C",
    textAlign: "center",
    marginBottom: 10,
  },
  modalType: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  modalUrl: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginBottom: 25,
    fontFamily: "monospace",
  },
  openButton: {
    backgroundColor: "#0A4DAB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  openButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
