import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function VideoViewer() {
  const router = useRouter();
  const { title, url } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const handlePlayVideo = async () => {
    setLoading(true);
    try {
      const supported = await Linking.canOpenURL(url as string);
      if (supported) {
        await Linking.openURL(url as string);
      } else {
        Alert.alert("Error", "Tidak bisa membuka video dengan device Anda");
      }
    } catch {
      Alert.alert("Error", "Gagal membuka video. Pastikan URL valid dan koneksi internet stabil");
    } finally {
      setLoading(false);
    }
  };

  // Ekstrak video ID dari URL YouTube jika ada
  const isYouTube = (url as string)?.includes("youtube.com") || (url as string)?.includes("youtu.be");
  const isMp4 = (url as string)?.includes(".mp4");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title || "Video Viewer"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.videoContainer}>
          <View style={styles.thumbnailBox}>
            <Ionicons name="play-circle" size={80} color="white" />
            <Text style={styles.playText}>Tekan Tombol Dibawah untuk Putar</Text>
          </View>

          <Text style={styles.videoTitle}>{title || "Video"}</Text>
          <Text style={styles.videoInfo}>
            {isYouTube ? "Video YouTube" : isMp4 ? "Video MP4" : "Video File"}
          </Text>
          <Text style={styles.urlText} numberOfLines={2}>{url}</Text>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#0A4DAB" style={{ marginRight: 10 }} />
            <Text style={styles.infoText}>
              Video akan dibuka dengan pemutar default di device Anda. Pastikan koneksi internet stabil untuk streaming video.
            </Text>
          </View>

          <View style={styles.detailsBox}>
            <Text style={styles.detailsTitle}>Format Video</Text>
            <Text style={styles.detailsText}>
              {isYouTube ? "🎬 Streaming YouTube" : isMp4 ? "🎥 MP4 Video" : "📹 Video File"}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.playButton, loading && styles.playButtonDisabled]}
          onPress={handlePlayVideo}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size={20} />
          ) : (
            <>
              <Ionicons name="play" size={20} color="white" style={{ marginRight: 10 }} />
              <Text style={styles.buttonText}>Putar Video</Text>
            </>
          )}
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
  videoContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  thumbnailBox: {
    backgroundColor: "#000",
    borderRadius: 10,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  playText: {
    color: "white",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#063A9C",
    marginBottom: 8,
  },
  videoInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  urlText: {
    fontSize: 11,
    color: "#999",
    marginBottom: 20,
    fontFamily: "monospace",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#E8F0FE",
    borderLeftWidth: 4,
    borderLeftColor: "#0A4DAB",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
    flex: 1,
  },
  detailsBox: {
    backgroundColor: "#F0F7FF",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D0E1FF",
  },
  detailsTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0A4DAB",
    marginBottom: 5,
  },
  detailsText: {
    fontSize: 14,
    color: "#063A9C",
  },
  footer: {
    padding: 15,
    backgroundColor: "white",
    elevation: 3,
  },
  playButton: {
    backgroundColor: "#0A4DAB",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
