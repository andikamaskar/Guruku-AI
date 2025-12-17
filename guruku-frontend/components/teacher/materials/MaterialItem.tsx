import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { Material } from '../../../services/materials';

interface MaterialItemProps {
    item: Material;
    onDelete: (id: string) => void;
    onEdit?: (item: Material) => void; // Optional for now
}

export default function MaterialItem({ item, onDelete, onEdit }: MaterialItemProps) {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={{ flexDirection: 'row' }}>
                    {onEdit && (
                        <TouchableOpacity onPress={() => onEdit(item)} style={{ marginRight: 10 }}>
                            <Ionicons name="create-outline" size={20} color="#0B409C" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => onDelete(item.id)}>
                        <Ionicons name="trash-outline" size={20} color="red" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ maxHeight: 200, overflow: 'hidden' }}>
                <Markdown>{item.content || "*Tidak ada konten tertulis.*"}</Markdown>
            </View>

            <View style={styles.attachments}>
                {item.file && (
                    <View style={styles.attachmentBadge}>
                        <Ionicons name="document-text-outline" size={16} color="#0B409C" />
                        <Text style={styles.attachmentText}>Dokumen</Text>
                    </View>
                )}
                {item.video_file && (
                    <View style={styles.attachmentBadge}>
                        <Ionicons name="videocam-outline" size={16} color="#0B409C" />
                        <Text style={styles.attachmentText}>Video</Text>
                    </View>
                )}
            </View>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    attachments: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 10,
    },
    attachmentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F1FF',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
        gap: 5,
    },
    attachmentText: {
        color: '#0B409C',
        fontSize: 12,
        fontWeight: '600',
    },
    date: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 10,
    },
});
