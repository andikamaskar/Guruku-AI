import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const fetchUserProfile = async () => {
    try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) throw new Error('No access token');

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/users/profile/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateUserProfile = async (formData: FormData) => {
    try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) throw new Error('No access token');

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Content-Type multipart/form-data is usually handled automatically when passing FormData
        const response = await api.patch('/users/profile/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            transformRequest: (data, headers) => {
                return data; // Prevent axios from stringifying FormData
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
