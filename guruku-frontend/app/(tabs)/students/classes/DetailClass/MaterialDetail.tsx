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
    Dimensions,
    Alert,
    Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video, ResizeMode } from 'expo-av';
import RenderHtml from 'react-native-render-html';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Ganti dengan URL API Anda
const API_URL = 'https://digressive-unfacilely-dorla.ngrok-free.dev/api';
const BASE_URL = 'https://digressive-unfacilely-dorla.ngrok-free.dev';

interface MaterialDetail {
    id: string;
    title: string;
    content: string;
    video_file: string | null;
    file: string | null;
    created_at: string;
    is_completed: boolean;
}

export default function MaterialDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const materialId = params.materialId as string;
    const titleParam = params.title as string;

    const [material, setMaterial] = useState<MaterialDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [markedAsRead, setMarkedAsRead] = useState(false);
    const videoRef = useRef(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const { width } = Dimensions.get('window');

    useEffect(() => {
        fetchMaterialDetail();
    }, [materialId]);

    const fetchMaterialDetail = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('accessToken');
            const response = await axios.get(`${API_URL}/materials/${materialId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterial(response.data);
            if (response.data.is_completed) {
                setMarkedAsRead(true);
            }
        } catch (error) {
            console.error("Error fetching material detail:", error);
            Alert.alert("Error", "Gagal memuat materi.");
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = (event: any) => {
        if (markedAsRead) return;

        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 20;
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            markAsComplete();
        }
    };

    const markAsComplete = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            await axios.post(`${API_URL}/materials/${materialId}/complete/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMarkedAsRead(true);
            // Optional: Show toast or small indicator
        } catch (error) {
            console.error("Error marking as complete:", error);
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
        return `${BASE_URL}${path}`;
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
                    {titleParam || "Materi"}
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
                    ref={scrollViewRef}
                    style={styles.contentContainer}
                    contentContainerStyle={styles.scrollContent}
                    onScroll={handleScroll}
                    scrollEventThrottle={400}
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
                                source={{ uri: getVideoUri(material.video_file) }}
                                useNativeControls
                                resizeMode={ResizeMode.CONTAIN}
                                isLooping={false}
                            />
                        </View>
                    )}

                    <View style={styles.htmlContainer}>
                        <RenderHtml
                            contentWidth={width - 40}
                            source={{ html: material.content }}
                            tagsStyles={{
                                p: { fontSize: 16, lineHeight: 24, color: '#333', marginBottom: 10 },
                                h1: { fontSize: 24, fontWeight: 'bold', color: '#0B409C', marginBottom: 10 },
                                h2: { fontSize: 20, fontWeight: 'bold', color: '#0B409C', marginBottom: 10 },
                                li: { fontSize: 16, lineHeight: 24, color: '#333' },
                            }}
                        />
                    </View>

                    {markedAsRead && (
                        <View style={styles.completedBadge}>
                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                            <Text style={styles.completedText}>Sudah Dibaca</Text>
                        </View>
                    )}

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
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 5,
    },
    backButtonTouchable: { marginRight: 15 },
    backButton: {
        padding: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 8,
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
    htmlContainer: {
        marginBottom: 20,
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4ADE80',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignSelf: 'center',
        marginTop: 20,
    },
    completedText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    errorText: { color: 'red', fontSize: 16 },
});
