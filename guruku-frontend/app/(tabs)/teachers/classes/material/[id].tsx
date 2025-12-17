import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Platform,
    ActivityIndicator,
    Alert,
    Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import MathRenderer from '../../../../../components/MathRenderer';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getMaterials, Material } from '../../../../../services/materials';
import axios from 'axios';
import { getAuthHeader } from '../../../../../services/api';
import API_BASE_URL from '../../../../../config/api';

export default function TeacherMaterialDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const materialId = params.id as string;

    const [material, setMaterial] = useState<Material | null>(null);
    const [loading, setLoading] = useState(true);
    const videoRef = useRef(null);

    useEffect(() => {
        fetchMaterialDetail();
    }, [materialId]);

    const fetchMaterialDetail = async () => {
        try {
            setLoading(true);
            const token = await getAuthHeader();
            // Reuse the same endpoint as list? No, we need detail. 
            // The service list returns details, but let's fetch specific if possible or filter from list if we only have list endpoint. 
            // Teacher's view usually uses the same API endpoint structure.
            // Wait, services/materials.ts has getMaterials(classId) but not getMaterial(id).
            // I'll assume we can use the backend endpoint /materials/{id}/ directly.

            const response = await axios.get(`${API_BASE_URL}/materials/${materialId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterial(response.data);
        } catch (error) {
            console.error("Error fetching material detail:", error);
            Alert.alert("Error", "Gagal memuat materi.");
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        if (!material) return;

        const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Helvetica, Arial, sans-serif; padding: 20px; }
            h1 { color: #0B409C; }
            .date { color: #666; font-size: 12px; margin-bottom: 20px; }
            .content { line-height: 1.6; }
          </style>
        </head>
        <body>
          <h1>${material.title}</h1>
          <p class="date">Dibuat pada: ${new Date(material.created_at).toLocaleDateString('id-ID')}</p>
          <div class="content">
            ${material.content}
          </div>
        </body>
      </html>
    `;

        try {
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            console.error("Error exporting PDF:", error);
            Alert.alert("Error", "Gagal mengexport PDF.");
        }
    };

    const getVideoUri = (path: string) => {
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL.replace('/api', '')}${path}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0B409C" />
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButtonTouchable}>
                    <View style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    Detail Materi
                </Text>
                <TouchableOpacity onPress={handleExportPDF} style={styles.pdfButton}>
                    <Ionicons name="document-text-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color="#0B409C" />
                </View>
            ) : material ? (
                <ScrollView
                    style={styles.contentContainer}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Text style={styles.title}>{material.title}</Text>
                    <Text style={styles.date}>
                        {new Date(material.created_at).toLocaleDateString('id-ID', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </Text>

                    {material.video_file && (
                        <View style={styles.videoContainer}>
                            <Video
                                ref={videoRef}
                                style={styles.video}
                                source={{ uri: getVideoUri(material.video_file as string) }}
                                useNativeControls
                                resizeMode={ResizeMode.CONTAIN}
                                isLooping={false}
                            />
                        </View>
                    )}

                    <View style={styles.markdownContainer}>
                        <MathRenderer expression={material.content} />
                    </View>

                    <View style={{ height: 50 }} />
                </ScrollView>
            ) : (
                <View style={styles.centerState}>
                    <Text style={styles.errorText}>Materi tidak ditemukan.</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        backgroundColor: '#0B409C',
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 50,
        paddingBottom: 20,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
    },
    backButtonTouchable: { marginRight: 15 },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    pdfButton: {
        padding: 5,
    },
    contentContainer: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { padding: 20 },
    centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    date: {
        fontSize: 14,
        color: '#888',
        marginBottom: 20,
    },
    videoContainer: {
        width: '100%',
        height: 200,
        backgroundColor: '#000',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    markdownContainer: {
        marginBottom: 20,
    },
    errorText: { color: 'red', fontSize: 16 },
});
