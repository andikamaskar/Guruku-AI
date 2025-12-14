import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const fetchClasses = async (mode: 'joined' | 'all' = 'joined') => {
    try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No access token found');
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const response = await api.get(`/classes/?mode=${mode}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching classes:', error);
        throw error;
    }
};


export const joinClass = async (inviteCode: string) => {
    try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No access token found');
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const response = await api.post('/classes/join/', { invite_code: inviteCode });
        return response.data;
    } catch (error) {
        console.error('Error joining class:', error);
        throw error;
    }
};

export const createClass = async (data: any) => {
    try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No access token found');
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const response = await api.post('/classes/', data);
        return response.data;
    } catch (error) {
        console.error('Error creating class:', error);
        throw error;
    }
};
