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
import MathRenderer from '../../../../../components/MathRenderer';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { marked } from 'marked';
import katex from 'katex';
import FloatingButton from '../../../../../components/FloatingButton';

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

        let finalHtml = "";
        try {
            // 1. Pre-process: Protect Math from Markdown parser
            // We replace $$...$$ and $...$ with placeholders
            const mathMap = new Map();
            let mathIndex = 0;

            // Regex for Block Math $$...$$
            let textWithPlaceholders = material.content.replace(/\$\$([\s\S]*?)\$\$/g, (match, tex) => {
                const key = `MATH_BLOCK_${mathIndex++}`;
                mathMap.set(key, { tex, display: true });
                return key;
            });

            // Regex for Inline Math $...$
            textWithPlaceholders = textWithPlaceholders.replace(/\$([^$]+?)\$/g, (match, tex) => {
                const key = `MATH_INLINE_${mathIndex++}`;
                mathMap.set(key, { tex, display: false });
                return key;
            });

            // 2. Parse Markdown
            // Import libraries dynamically or at top-level (assuming imports exist)
            // We use 'marked' from imports
            const markedHtml = await marked.parse(textWithPlaceholders);

            // 3. Restore Math and Render with KaTeX
            // We need to import katex at top level: import katex from 'katex';
            // Assuming it's imported. If not, this code relies on it.
            // const katex = require('katex'); // Fallback or use import

            finalHtml = markedHtml.replace(/MATH_(BLOCK|INLINE)_\d+/g, (match) => {
                const entry = mathMap.get(match);
                if (!entry) return match;
                try {
                    return katex.renderToString(entry.tex, {
                        displayMode: entry.display,
                        throwOnError: false
                    });
                } catch (e) {
                    console.error("KaTeX error", e);
                    return entry.tex; // Fallback to source
                }
            });

        } catch (error) {
            console.error("Render error:", error);
            finalHtml = material.content; // Worst case fallback
        }

        const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${material.title}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
          <style>
            @page {
                margin: 20mm;
            }
            body { 
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
                margin: 0;
                color: #333;
                background: white;
            }
            /* Specific padding for screen view if needed, but print uses @page */
            .container {
                padding: 40px;
            }
            
            h1 { color: #0B409C; border-bottom: 2px solid #EEE; padding-bottom: 10px; margin-bottom: 5px; }
            .meta { color: #666; font-size: 12px; margin-bottom: 30px; font-style: italic; }
            .content { line-height: 1.6; font-size: 14px; text-align: justify; }
            p { margin-bottom: 15px; }
            blockquote { border-left: 4px solid #0B409C; padding-left: 15px; color: #555; margin: 20px 0; background-color: #f9f9f9; padding: 10px; }
            code { background-color: #f4f4f4; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
            pre { background-color: #f4f4f4; padding: 15px; overflow-x: auto; border-radius: 4px; margin: 15px 0; }
            img { max-width: 100%; height: auto; display: block; margin: 20px auto; }
            
            .katex { font-size: 1.1em; }
            
            @media print {
                body { 
                    /* Expo Print uses this margin if @page is supported, or we simulate it */
                    margin: 20px; 
                }
            }
          </style>
        </head>
        <body>
            <div class="container">
              <h1>${material.title}</h1>
              <p class="meta">Dibuat pada: ${new Date(material.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              
              <div class="content">
                ${finalHtml}
              </div>
            </div>
        </body>
      </html>
    `;

        try {
            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                base64: false,
                margins: { // This ensures the PDF margin logic works from React Native side too
                    left: 20,
                    right: 20,
                    top: 20,
                    bottom: 20
                }
            });
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
                <>
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
                            <MathRenderer expression={material.content} />
                        </View>

                        {markedAsRead ? (
                            <View style={styles.completedBadge}>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Text style={styles.completedText}>Sudah Dibaca</Text>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.markReadButton} onPress={markAsComplete}>
                                <Text style={styles.markReadButtonText}>Tandai Sudah Dibaca</Text>
                            </TouchableOpacity>
                        )}

                        <View style={{ height: 50 }} />
                    </ScrollView>

                    <FloatingButton />
                </>
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
    markReadButton: {
        backgroundColor: '#E0E0E0',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        alignSelf: 'center',
        marginTop: 20,
    },
    markReadButtonText: {
        color: '#555',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
