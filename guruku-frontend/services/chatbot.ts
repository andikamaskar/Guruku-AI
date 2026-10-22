import api from "./api";

export interface ChatMessage {
    id: number;
    role: "user" | "bot";
    content: string;
    timestamp: string;
}

export interface Conversation {
    id: number;
    title: string;
    created_at: string;
}

export const getConversations = async () => {
    const res = await api.get("/chatbot/conversations/");
    return res.data;
};

export const createConversation = async (title: string = "Percakapan Baru") => {
    const res = await api.post("/chatbot/conversations/", { title });
    return res.data;
};

export const getConversationDetail = async (conversationId: number) => {
    const res = await api.get(`/chatbot/conversations/${conversationId}/`);
    return res.data;
};

export const sendMessage = async (
    conversationId: number,
    message: string,
    contextMessageIds: number[] = [],
) => {
    const payload: { message: string; context_message_ids?: number[] } = { message };
    if (contextMessageIds.length > 0) {
        payload.context_message_ids = contextMessageIds;
    }
    const res = await api.post(`/chatbot/conversations/${conversationId}/message/`, payload);
    return res.data;
};

export const getChatbotErrorMessage = (error: any): string => {
    const status = error?.response?.status;
    if (status === 400) return "Pesan atau topik pertanyaan tidak valid.";
    if (status === 403) return "Anda tidak memiliki akses ke chatbot.";
    if (status === 429) return "Batas penggunaan tercapai. Coba lagi dalam beberapa menit.";
    if (status >= 500) return "Maaf, tutor AI sedang mengalami gangguan. Silakan coba lagi nanti.";
    if (!error?.response) return "Backend tidak dapat dihubungi. Periksa koneksi Anda.";
    return "Pesan tidak terkirim. Silakan coba lagi.";
};
