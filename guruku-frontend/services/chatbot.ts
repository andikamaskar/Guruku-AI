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

export const sendMessage = async (conversationId: number, message: string) => {
    const res = await api.post(`/chatbot/conversations/${conversationId}/message/`, { message });
    return res.data;
};
