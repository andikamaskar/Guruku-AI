import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Linking, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function LKPDViewer() {
  const router = useRouter();
  const { title, url } = useLocalSearchParams();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Contoh soal LKPD
  const questions = [
    {
      id: 1,
      question: "Apa itu informatika?",
      type: "text",
    },
    {
      id: 2,
      question: "Jelaskan perbedaan antara hardware dan software",
      type: "text",
    },
    {
      id: 3,
      question: "Sebutkan 3 contoh perangkat input",
      type: "text",
    },
  ];

  const handleAnswerChange = (questionId: number, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const handleSubmit = () => {
    const allAnswered = questions.every((q) => answers[q.id]?.trim());
    if (!allAnswered) {
      Alert.alert("Peringatan", "Silakan jawab semua pertanyaan terlebih dahulu");
      return;
    }
    setSubmitted(true);
    Alert.alert("Berhasil", "LKPD Anda telah disimpan. Guru akan memeriksa jawaban Anda.", [
      { text: "OK", onPress: () => setSubmitted(false) },
    ]);
  };

  const handleDownloadPDF = async () => {
    try {
      const supported = await Linking.canOpenURL(url as string);
      if (supported) {
        await Linking.openURL(url as string);
      } else {
        Alert.alert("Error", "Tidak bisa membuka file");
      }
    } catch {
      Alert.alert("Error", "Gagal membuka file");
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
          {title || "LKPD"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.lkpdContainer}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Ionicons name="document-text" size={40} color="#0A4DAB" />
            <Text style={styles.lkpdTitle}>{title || "LKPD"}</Text>
            <Text style={styles.lkpdSubtitle}>Lembar Kerja Peserta Didik</Text>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsTitle}>📋 Petunjuk Pengerjaan</Text>
            <Text style={styles.instructionsText}>
              Jawab semua pertanyaan di bawah ini dengan jelas dan singkat. Pengerjaan LKPD ini akan diperiksa oleh guru Anda.
            </Text>
          </View>

          {/* Questions Section */}
          <Text style={styles.sectionTitle}>Pertanyaan</Text>
          {questions.map((question, index) => (
            <View key={question.id} style={styles.questionBox}>
              <Text style={styles.questionNumber}>
                {index + 1}. {question.question}
              </Text>
              <TextInput
                style={styles.answerInput}
                placeholder="Tuliskan jawaban Anda di sini..."
                multiline
                numberOfLines={4}
                value={answers[question.id] || ""}
                onChangeText={(text) => handleAnswerChange(question.id, text)}
                editable={!submitted}
                placeholderTextColor="#ccc"
              />
              <Text style={styles.characterCount}>
                {answers[question.id]?.length || 0} karakter
              </Text>
            </View>
          ))}

          {/* Download Original PDF */}
          <TouchableOpacity style={styles.downloadLink} onPress={handleDownloadPDF}>
            <Ionicons name="download" size={16} color="#0A4DAB" />
            <Text style={styles.downloadText}>Unduh LKPD PDF Original</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, submitted && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitted}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginRight: 10 }} />
          <Text style={styles.submitButtonText}>
            {submitted ? "✓ Terkirim" : "Kirim LKPD"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
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
    padding: 15,
  },
  lkpdContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    marginBottom: 20,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  lkpdTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#063A9C",
    marginTop: 10,
  },
  lkpdSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 5,
  },
  instructionsBox: {
    backgroundColor: "#E8F0FE",
    borderLeftWidth: 4,
    borderLeftColor: "#0A4DAB",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0A4DAB",
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#063A9C",
    marginBottom: 15,
  },
  questionBox: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: "#0A4DAB",
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#063A9C",
    marginBottom: 12,
  },
  answerInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: "#333",
    textAlignVertical: "top",
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 11,
    color: "#999",
    textAlign: "right",
  },
  downloadLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F0F7FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D0E1FF",
    marginTop: 10,
  },
  downloadText: {
    fontSize: 13,
    color: "#0A4DAB",
    fontWeight: "600",
    marginLeft: 8,
  },
  footer: {
    padding: 15,
    backgroundColor: "white",
    elevation: 3,
  },
  submitButton: {
    backgroundColor: "#0A4DAB",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#90CAF9",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
