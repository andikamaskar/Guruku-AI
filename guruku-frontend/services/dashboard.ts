import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const fetchDashboardData = async () => {
    try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No access token found');
        }

        // Ensure the token is set in the api instance
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const response = await api.get('/users/dashboard/');

        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
};

export const fetchTeacherDashboardData = async () => {
    try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) throw new Error('No token');
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const response = await api.get('/users/dashboard/teacher/');
        return response.data;
    } catch (error) {
        console.error('Error fetching teacher dashboard data:', error);
        throw error;
    }
};

export const fetchAnnouncements = async () => {
    try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) throw new Error('No token');
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const response = await api.get('/users/announcements/');
        return response.data;
    } catch (error) {
        console.error('Error fetching announcements:', error);
        throw error;
    }
};
