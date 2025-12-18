import React, { useState, useRef, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Stack } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ListRenderItem,
  ActivityIndicator,
  ImageBackground,
  Alert,
  Dimensions,
  Image
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Markdown from 'react-native-markdown-display';
import { getConversations, createConversation, sendMessage, getConversationDetail, ChatMessage } from "../../services/chatbot";
import { fetchDashboardData } from "../../services/dashboard";
import MathRenderer from "../../components/MathRenderer";

export default function ChatBotScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const navigation = useNavigation();

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      setLoading(true);
      // 1. Cek apakah ada percakapan sebelumnya
      const convos = await getConversations();

      if (convos.length > 0) {
        // Ambil percakapan terakhir
        const lastConvo = convos[0];
        setConversationId(lastConvo.id);

        // Ambil detail pesan
        const detail = await getConversationDetail(lastConvo.id);
        // Backend return { id, title, messages: [...] }
        setMessages(detail.messages || []);
      } else {
        // Buat percakapan baru
        const newConvo = await createConversation();
        setConversationId(newConvo.conversation_id);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error init chat:", error);
      Alert.alert("Error", "Gagal memuat percakapan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (inputText.trim().length === 0 || !conversationId) return;

    const textToSend = inputText;
    setInputText(""); // Clear input immediately
    setSending(true);

    // Optimistic Update
    const tempId = Date.now();
    const tempMessage: ChatMessage = {
      id: tempId,
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await sendMessage(conversationId, textToSend);
      // Response: { user_message: {...}, bot_message: {...} }

      // Replace temp message with real one and add bot message
      setMessages((prev) => {
        const filtered = prev.filter(m => m.id !== tempId);
        return [...filtered, response.user_message, response.bot_message];
      });
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Gagal", "Pesan tidak terkirim.");
      // Remove temp message on failure
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      setInputText(textToSend); // Restore text
    } finally {
      setSending(false);
    }
  };

  const renderMessage: ListRenderItem<ChatMessage> = ({ item: msg }) => {
    const isUser = msg.role === "user";
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../assets/images/ChatBot-Image.png')}
              style={styles.avatarImage}
            />
          </View>
        )}

        <View style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.botBubble,
          /* Fix: WebView inside Flex needs explicit width, otherwise it collapses. 
             If message has math, force bubble to be 75% of screen width. */
          !isUser && (msg.content.includes("$$") || msg.content.includes("$")) && { width: Dimensions.get('window').width * 0.75 }
        ]}>
          {msg.role === "user" ? (
            <Markdown
              style={{
                body: {
                  color: isUser ? '#000' : '#000',
                  fontSize: 15,
                  lineHeight: 22
                },
                paragraph: {
                  marginBottom: 0,
                  marginTop: 0,
                }
              }}
            >
              {msg.content}
            </Markdown>
          ) : (
            /* Bot Message: Check for Math */
            (msg.content.includes("$$") || msg.content.includes("$")) ? (
              <MathRenderer expression={msg.content} textColor="#000000" />
            ) : (
              <Markdown
                style={{
                  body: {
                    color: '#000',
                    fontSize: 15,
                    lineHeight: 22
                  },
                  paragraph: {
                    marginBottom: 0,
                    marginTop: 0,
                  }
                }}
              >
                {msg.content}
              </Markdown>
            )
          )}

          <Text style={[styles.timeText, isUser ? styles.userTimeText : styles.botTimeText]}>
            {time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Guruku AI</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Chat Area & Input Area wrapped in KeyboardAvoidingView */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={{ flex: 1 }}
      >
        <ImageBackground
          // source={require('../../assets/images/chat-bg.png')}
          style={styles.chatBackground}
          imageStyle={{ opacity: 0.1 }}
        >
          {loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color="#0B409C" />
            </View>
          ) : (
            <>
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.chatList}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
        </ImageBackground>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="add" size={24} color="#0B409C" />
            </TouchableOpacity>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ketik pesan..."
              placeholderTextColor="#999"
              style={styles.input}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() && !sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E5E5E5" },

  // Header
  header: {
    backgroundColor: "#0B409C",
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 10,
  },
  backButton: { marginRight: 15 },
  headerInfo: { flex: 1 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  headerStatus: { color: "#E0E0E0", fontSize: 12 },

  // Chat Area
  chatBackground: { flex: 1, backgroundColor: "#EFE7DE" },
  chatList: { padding: 15, paddingBottom: 20 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Message Bubbles
  messageRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-end",
  },
  userRow: { justifyContent: "flex-end" },
  botRow: { justifyContent: "flex-start" },

  avatarContainer: {
    width: 32,
    height: 32,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 2,
  },

  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userBubble: {
    backgroundColor: "#DCF8C6",
    borderTopRightRadius: 0,
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 0,
  },

  timeText: {
    fontSize: 10,
    color: "#999",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  userTimeText: { color: "#7FA87F" },
  botTimeText: { color: "#999" },

  // Input Area
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    paddingBottom: Platform.OS === 'android' ? 20 : 10,
    backgroundColor: "#fff",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    paddingHorizontal: 5,
    marginRight: 10,
    minHeight: 45,
    maxHeight: 100,
  },
  attachButton: { padding: 8 },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 5,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#0B409C",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: "#B0BEC5",
  },
  avatarImage: {
    width: 32,
    height: 32,
  }
});
