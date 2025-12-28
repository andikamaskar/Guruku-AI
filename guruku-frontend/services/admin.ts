import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const getAuthHeader = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No access token');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return token;
}

export const fetchAdminStats = async () => {
    await getAuthHeader();
    const response = await api.get('/admin/stats');
    return response.data;
};

export const fetchVerificationRequests = async () => {
    await getAuthHeader();
    const response = await api.get('/admin/verifications');
    return response.data;
};

export const verifyUser = async (userId: number) => {
    await getAuthHeader();
    const response = await api.post(`/admin/${userId}/verify_user`);
    return response.data;
};

export const createAnnouncement = async (data: { title: string; content: string; target_role: string }) => {
    await getAuthHeader();
    const response = await api.post('/announcements', data);
    return response.data;
};
