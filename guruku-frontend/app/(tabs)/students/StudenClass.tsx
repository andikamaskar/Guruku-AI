import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import BottomNav from "../../../components/BottomNav";

const COLORS = {
  primary: "#0B409C",
  lightGray: "#E0E0E0",
  secondary: "#FFC107",
  darkText: "#333",
  mediumText: "#666",
  bg: "#F5F6FA",
};

// === CLASS CARD === //
function ClassCard({
  id,
  title,
  guru,
  image,
  isJoined,
  progress,
  onJoin,
  kodeKelas,
}: ClassCardProps) {
  return (
    <View style={styles.classCardContent}>
      <LinearGradient
        colors={["#0B409C", "#0A2D69"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.imageWrapper}
        >

        <View style={styles.emptyClassImage}>
          {image ? (
            <Image source={image} style={styles.cardImageActual} />
          ) : (
            <Text style={{ color: COLORS.mediumText, fontSize: 10 }}>
              {kodeKelas}
            </Text>
          )}
        </View>
      </LinearGradient>

      <View style={styles.textWrapper}>
        <View>
          <Text style={styles.classTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.classGuru}>{guru}</Text>
          <Text style={styles.classCode}>{kodeKelas}</Text>
        </View>

        {isJoined ? (
          <View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` },
                  { backgroundColor: COLORS.primary },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: COLORS.primary }]}>
              {progress}% Progress
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => onJoin(id)}
          >
            <Text style={styles.joinButtonText}>Gabung Sekarang</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
// === END CLASS CARD === //

export default function StudenClass() {
  const [searchQuery, setSearchQuery] = useState("");

  const [kelasList, setKelasList] = useState([
    {
      id: 1,
      title: "Aplikasi dan Pemrograman | Kelas X PPL",
      image: null,
      guru: "Budi Setiawan",
      isJoined: true,
      progress: 70,
      kodeKelas: "AP-101",
      lastAccessed: Date.now() - 500000,
    },
    {
      id: 2,
      title: "Pemrograman Internet | Kelas XI RPL",
      image: null,
      guru: "Nur Aini",
      isJoined: false,
      progress: 0,
      kodeKelas: "PI-205",
      lastAccessed: null,
    },
    {
      id: 3,
      title: "Matematika | Kelas X IPA",
      image: null,
      guru: "Rina Dewi",
      isJoined: true,
      progress: 30,
      kodeKelas: "MT-102",
      lastAccessed: Date.now(),
    },
    {
      id: 4,
      title: "Desain Grafis | Umum",
      image: null,
      guru: "Ayu Lestari",
      isJoined: false,
      progress: 0,
      kodeKelas: "DG-300",
      lastAccessed: null,
    },
    {
      id: 5,
      title: "Bahasa Inggris | Umum",
      image: null,
      guru: "Sarah Wati",
      isJoined: true,
      progress: 50,
      kodeKelas: "BI-201",
      lastAccessed: Date.now() - 100000,
    },
  ]);

  const handleJoinClass = (classId) => {
    setKelasList((prev) =>
      prev.map((kelas) =>
        kelas.id === classId
          ? { ...kelas, isJoined: true, lastAccessed: Date.now() }
          : kelas
      )
    );
    alert("Berhasil bergabung ke kelas!");
  };

  const handleAccessClass = (classId) => {
    setKelasList((prev) =>
      prev.map((kelas) =>
        kelas.id === classId
          ? { ...kelas, lastAccessed: Date.now() }
          : kelas
      )
    );
  };

  // FILTER SEARCH
  const filtered = kelasList.filter((kelas) => {
    const q = searchQuery.toLowerCase();
    return (
      kelas.title.toLowerCase().includes(q) ||
      kelas.guru.toLowerCase().includes(q) ||
      kelas.kodeKelas.toLowerCase().includes(q)
    );
  });

  const joined = filtered.filter((k) => k.isJoined);
  const suggested = filtered.filter((k) => !k.isJoined);

  const sortedJoined = [...joined].sort(
    (a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0)
  );

  const [activeTab, setActiveTab] = useState("joined");

  const displayedClasses =
    activeTab === "joined" ? sortedJoined : suggested;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
            colors={["#005DFF", "#0B409C"]}  // gradient biru atas → bawah
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.header}
        >
            <View style={styles.headerTop}>
                <View>
                <Text style={styles.headerTitle}>Halo, Veronica</Text>
                <Text style={styles.headerSubtitle}>Apa yang ingin kamu pelajari</Text>
                </View>

                <TouchableOpacity style={styles.profileCircle}>
                <Text style={{ color: "white", fontWeight: "bold" }}>V</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.searchWrapper, { marginTop: 20 }]}>
                <TextInput
                placeholder="Cari Kelas"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                />
            </View>

            <View style={styles.tabRowInHeader}>
                <TouchableOpacity
                style={
                    activeTab === "joined"
                    ? styles.tabActiveInHeader
                    : styles.tabInactiveInHeader
                }
                onPress={() => setActiveTab("joined")}
                >
                <Text
                    style={
                    activeTab === "joined"
                        ? styles.tabActiveTextInHeader
                        : styles.tabInactiveTextInHeader
                    }
                >
                    Kelas Yang Diikuti
                </Text>
                </TouchableOpacity>

                <TouchableOpacity
                style={
                    activeTab === "suggested"
                    ? styles.tabActiveInHeader
                    : styles.tabInactiveInHeader
                }
                onPress={() => setActiveTab("suggested")}
                >
                <Text
                    style={
                    activeTab === "suggested"
                        ? styles.tabActiveTextInHeader
                        : styles.tabInactiveTextInHeader
                    }
                >
                    Disarankan Untuk Anda
                </Text>
                </TouchableOpacity>
            </View>
            </LinearGradient>


        <Text style={styles.sectionTitle}>Daftar Kelas</Text>

        <View style={styles.classGrid}>
          {displayedClasses.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.cardWrapperTouchable}
              onPress={() => item.isJoined && handleAccessClass(item.id)}
            >
              <ClassCard
                {...item}
                onJoin={handleJoinClass}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 20, 
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginBottom: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },
  headerSubtitle: { color: "#e7e7e7", fontSize: 14, marginTop: 2 },
  profileCircle: {
    width: 40,
    height: 40,
    backgroundColor: "#1E5CE5",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  
  // --- Style SEARCH ---
  searchWrapper: {
    flexDirection: "row",
    backgroundColor: "#fff",
    elevation: 6,
    borderRadius: 10,
    padding: 6,
    height: 46,
  },
  searchInput: { flex: 1, paddingHorizontal: 15, fontSize: 16 },

  // --- STYLE TAB (Di Dalam Header) ---
  tabRowInHeader: { 
    marginTop: 10,
    flexDirection: "row", 
    justifyContent: 'center', 
  },
  tabActiveInHeader: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.secondary, 
  },
  tabActiveTextInHeader: { 
    color: 'white', 
    fontWeight: "bold" 
  }, 
  tabInactiveInHeader: { 
    paddingVertical: 6, 
    paddingHorizontal: 12 
  },
  tabInactiveTextInHeader: { 
    color: "#e7e7e7" 
  },
  
  sectionTitle: {
    marginTop: 25, 
    marginLeft: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  
  // --- Style Class Card ---
  classGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  cardWrapperTouchable: {
    width: "47%",
    marginBottom: 20,
  },
  classCardContent: {
    borderRadius: 15,
    padding: 0,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    minHeight: 260,
    overflow: "hidden",
  },
  imageWrapper: {
    width: "100%",
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 0,
    padding: 5,
  },
  emptyClassImage: {
    width: "90%",
    height: 110,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardImageActual: { width: "100%", height: "100%", borderRadius: 10 },
  textWrapper: {
    flex: 1,
    justifyContent: "space-between",
    marginTop: 10,
    marginHorizontal: 12,
    paddingBottom: 10,
  },
  classTitle: { fontSize: 13, fontWeight: "700", color: COLORS.darkText },
  classGuru: { fontSize: 11, color: "#666", marginTop: 2 },

  classCode: {
    fontSize: 10,
    color: COLORS.mediumText,
    marginTop: 2,
    fontStyle: "italic",
  },

  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginTop: 8,
  },
  progressFill: {
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 2,
  },

  joinButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  joinButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
});
