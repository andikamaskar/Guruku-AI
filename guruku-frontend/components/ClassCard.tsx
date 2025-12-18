import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ImageSourcePropType,
    TouchableOpacity,
    GestureResponderEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";

interface ClassCardProps {
    id: string;
    title: string;
    guru: string;
    image?: ImageSourcePropType | null;
    isJoined: boolean;
    progress: number;
    kodeKelas: string;
    onJoin: (id: string) => void;
    bgColors?: [string, string]; // Optional override
}

const COLORS = {
    primary: "#0B409C",
    mediumText: "#666",
    darkText: "#333",
};

const ClassCard: React.FC<ClassCardProps> = ({
    id,
    title,
    guru,
    image,
    isJoined,
    progress,
    onJoin,
    kodeKelas,
}) => {
    // Generate random gradient pair based on class ID (or code) so it's consistent
    const gradients = [
        ['#4facfe', '#00f2fe'],
        ['#43e97b', '#38f9d7'],
        ['#fa709a', '#fee140'],
        ['#667eea', '#764ba2'],
        ['#f093fb', '#f5576c'],
        ['#89f7fe', '#66a6ff'],
    ];

    // Use a simple hash to pick a gradient
    const hash = id ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    const colors = gradients[hash % gradients.length] as [string, string, ...string[]];

    return (
        <View style={styles.classCardContent}>
            {/* Header Image / Gradient Area */}
            <View style={styles.cardHeader}>
                {image ? (
                    <Image source={image} style={styles.cardImageActual} />
                ) : (
                    <LinearGradient
                        colors={colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardGradientBg}
                    >
                        {/* Background Pattern Icon */}
                        <Ionicons
                            name="school-outline"
                            size={80}
                            color="rgba(255,255,255,0.2)"
                            style={styles.bgPatternIcon}
                        />

                        {/* Class Code Badge */}
                        <View style={styles.codeBadge}>
                            <Text style={styles.codeBadgeText}>{kodeKelas}</Text>
                        </View>
                    </LinearGradient>
                )}
            </View>

            <View style={styles.textWrapper}>
                <View>
                    <Text style={styles.classTitle} numberOfLines={2}>
                        {title}
                    </Text>
                    <Text style={styles.classGuru}>{guru}</Text>
                </View>

                {isJoined ? (
                    <View style={{ marginTop: 10 }}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${progress}%` as any },
                                    { backgroundColor: colors[0] }, // Use dynamic color for progress bar too
                                ]}
                            />
                        </View>
                        <Text style={[styles.progressText, { color: colors[0] }]}>
                            {progress}% Progress
                        </Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.joinButton, { backgroundColor: colors[0] }]}
                        onPress={(e: GestureResponderEvent) => {
                            e.stopPropagation();
                            onJoin(id);
                        }}
                    >
                        <Text style={styles.joinButtonText}>Gabung Sekarang</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default ClassCard;

const styles = StyleSheet.create({
    classCardContent: {
        borderRadius: 16,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#f0f0f0",
        minHeight: 260,
    },

    // Header Area
    cardHeader: {
        width: "100%",
        height: 120,
        backgroundColor: "#f0f0f0",
        position: 'relative',
    },
    cardGradientBg: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        position: 'relative',
        overflow: 'hidden',
    },
    bgPatternIcon: {
        position: 'absolute',
        right: -10,
        bottom: -10,
        transform: [{ rotate: '-15deg' }],
    },
    cardImageActual: {
        width: "100%",
        height: "100%",
        resizeMode: "cover"
    },

    // Badge
    codeBadge: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    codeBadgeText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#333",
        letterSpacing: 1,
    },

    // Body Area
    textWrapper: {
        padding: 12,
        flex: 1,
        justifyContent: "space-between",
    },
    classTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#2c3e50",
        marginBottom: 4,
        lineHeight: 20,
    },
    classGuru: {
        fontSize: 12,
        color: "#7f8c8d",
        marginBottom: 8,
    },

    // Actions
    progressBar: {
        width: "100%",
        height: 6,
        backgroundColor: "#eee",
        borderRadius: 3,
        marginBottom: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: "100%",
        borderRadius: 3,
    },
    progressText: {
        fontSize: 10,
        fontWeight: "600",
        textAlign: "right",
    },
    joinButton: {
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 'auto', // Push to bottom
    },
    joinButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 12,
    },
});
