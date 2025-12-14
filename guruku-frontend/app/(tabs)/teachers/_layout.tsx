import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { fetchUserProfile } from '../../../services/user';

export default function TeacherLayout() {
    const [isVerified, setIsVerified] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        checkVerification();
    }, []);

    const checkVerification = async () => {
        try {
            const user = await fetchUserProfile();
            setIsVerified(user.is_verified);
        } catch (error) {
            console.error("Failed to check verification status", error);
            // Fallback: assume not verified or handle error
            setIsVerified(false);
        } finally {
            setLoading(false);
        }
    };

    // Protect routes logic
    useEffect(() => {
        if (loading) return;

        // Check if we are in the teachers tab
        const inTeacherTabs = segments.length > 1 && segments[0] === '(tabs)' && segments[1] === 'teachers';

        // Check if accessing restricted areas (classes, quizzes)
        // segments example: ['(tabs)', 'teachers', 'classes', 'BuatKelas']
        const accessingProtected = segments.includes('classes') || segments.includes('quizzes');

        if (!isVerified && accessingProtected && inTeacherTabs) {
            // Redirect to dashboard if trying to access protected routes while unverified
            router.replace('/(tabs)/teachers');
        }
    }, [isVerified, loading, segments]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0B409C" />
            </View>
        );
    }

    // Use auto-routing by not defining children
    return <Stack screenOptions={{ headerShown: false }} />;
}
