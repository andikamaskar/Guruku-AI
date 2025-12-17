import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export interface Material {
    id: string;
    class_obj: string;
    title: string;
    content: string;
    video_file: string | null;
    file: string | null;
    created_at: string;
}

const getAuthHeader = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
        throw new Error('No access token found');
    }
    return token;
};

export const getMaterials = async (classId: string) => {
    try {
        const token = await getAuthHeader();
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get(`/materials/class/${classId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createMaterial = async (classId: string, data: { title: string; content: string; file?: any; video?: any }) => {
    try {
        const token = await getAuthHeader();
        // multipart/form-data request requires the token as well
        // Note: axios instance 'api' might have json content type by default, we override it here.

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('content', data.content);

        if (data.file) {
            // @ts-ignore
            formData.append('file', {
                uri: data.file.uri,
                type: data.file.mimeType || 'application/pdf',
                name: data.file.name || 'file.pdf',
            });
        }

        if (data.video) {
            // @ts-ignore
            formData.append('video_file', {
                uri: data.video.uri,
                type: 'video/mp4', // Adjust based on actual type if possible
                name: 'video.mp4',
            });
        }

        const response = await api.post(`/materials/class/${classId}/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const generateContentFromFile = async (file: any) => {
    try {
        const token = await getAuthHeader();
        const formData = new FormData();

        // @ts-ignore
        formData.append('file', {
            uri: file.uri,
            type: file.mimeType || 'application/pdf',
            name: file.name || 'document.pdf',
        });

        const response = await api.post('/materials/generate-content/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateMaterial = async (materialId: string, data: Partial<{ title: string; content: string }>) => {
    try {
        const token = await getAuthHeader();
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.patch(`/materials/${materialId}/`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteMaterial = async (materialId: string) => {
    try {
        const token = await getAuthHeader();
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await api.delete(`/materials/${materialId}/`);
    } catch (error) {
        throw error;
    }
};
