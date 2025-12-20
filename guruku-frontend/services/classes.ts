import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { getAuthHeader } from './api';

export const updateClass = async (id: string, data: any) => {
    try {
        const token = await getAuthHeader();
        if (!token) throw new Error('No access token found');

        const response = await api.patch(`/classes/${id}/`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating class:', error);
        throw error;
    }
};

export const deleteClass = async (id: string) => {
    try {
        const token = await getAuthHeader();
        if (!token) throw new Error('No access token found');

        const response = await api.delete(`/classes/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting class:', error);
        throw error;
    }
};

export const leaveClass = async (id: string) => {
    try {
        const token = await getAuthHeader();
        if (!token) throw new Error('No access token found');

        const response = await api.post(`/classes/${id}/leave/`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error leaving class:', error);
        throw error;
    }
};

export const fetchClassDetails = async (id: string) => {
    try {
        const token = await getAuthHeader();
        if (!token) throw new Error('No access token found');

        const response = await api.get(`/classes/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching class details:', error);
        throw error;
    }
};

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

export const getClassStudents = async (classId: string) => {
    try {
        const token = await getAuthHeader();
        if (!token) throw new Error('No access token found');

        const response = await api.get(`/classes/${classId}/students/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching class students:', error);
        throw error;
    }
};

export const getAnnouncements = async (classId: string) => {
    try {
        const token = await getAuthHeader();
        const response = await api.get(`/classes/${classId}/announcements/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching announcements:', error);
        throw error;
    }
};

export const createAnnouncement = async (classId: string, content: string) => {
    try {
        const token = await getAuthHeader();
        const response = await api.post(`/classes/${classId}/announcements/`, { content }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating announcement:', error);
        throw error;
    }
};
