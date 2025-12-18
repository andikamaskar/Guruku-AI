import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AnnouncementProps {
    title: string;
    content: string;
    date: string;
    onPress?: () => void;
}

const AnnouncementCard: React.FC<AnnouncementProps> = ({ title, content, date, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.container}
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="megaphone-outline" size={20} color="#FF9800" />
                    </View>
                    <Text style={styles.date}>{date}</Text>
                </View>

                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <Text style={styles.content} numberOfLines={2}>{content}</Text>

                <View style={styles.footer}>
                    <Text style={styles.readMore}>Baca selengkapnya</Text>
                    <Ionicons name="arrow-forward" size={14} color="#0B409C" />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#fff',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        marginHorizontal: 4, // for shadow visibility
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FFF3E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    date: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 6,
    },
    content: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readMore: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0B409C',
    },
});

export default AnnouncementCard;
