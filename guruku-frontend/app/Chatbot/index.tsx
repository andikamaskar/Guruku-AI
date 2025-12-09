import React, { useState, useRef, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
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
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

export default function ChatBotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Lorem Ipsum is simply dummy", sender: "user" },
    {
      id: 2,
      text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
      sender: "bot",
    },
  ]);

  const [inputText, setInputText] = useState<string>("");

  const flatListRef = useRef<FlatList<Message>>(null);

  const navigation = useNavigation();

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = () => {
    if (inputText.trim().length === 0) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: "user",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // Auto response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Pertanyaanmu: " + newMessage.text,
          sender: "bot",
        },
      ]);
    }, 800);
  };

  const renderMessage: ListRenderItem<Message> = ({ item: msg }) => (
    <View
      style={[
        styles.messageRow,
        msg.sender === "user" ? styles.userRow : styles.botRow,
      ]}
    >
      {msg.sender === "bot" && <View style={styles.avatar} />}

      <View
        style={[
          styles.bubble,
          msg.sender === "user" ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            msg.sender === "user" && styles.userMessageText,
          ]}
        >
          {msg.text}
        </Text>
      </View>

      {msg.sender === "user" && (
        <Ionicons name="person-circle-outline" size={35} color="#000" />
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>ChatBot Guruku-AI</Text>

        <Ionicons name="person-circle-outline" size={35} color="#fff" />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.chatArea}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask Anything..."
          style={styles.input}
        />

        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    height: 80,
    backgroundColor: "#0A4D9F",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    paddingTop: 25,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  chatArea: {
    padding: 20,
    flexGrow: 1,
    justifyContent: "flex-end",
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 18,
  },

  userRow: {
    justifyContent: "flex-end",
  },

  botRow: {
    justifyContent: "flex-start",
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 50,
    backgroundColor: "#d9d9d9",
    marginRight: 10,
  },

  bubble: {
    maxWidth: "70%",
    padding: 12,
    borderRadius: 20,
  },

  userBubble: {
    backgroundColor: "#7b9edf",
    borderTopRightRadius: 0,
    marginRight: 10,
  },

  botBubble: {
    backgroundColor: "#f0f0f0",
    borderTopLeftRadius: 0,
    marginLeft: 10,
  },

  messageText: {
    fontSize: 15,
    color: "#000",
  },

  userMessageText: {
    color: "#fff",
  },

  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },

  input: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    height: 50,
    paddingHorizontal: 15,
    borderRadius: 30,
    fontSize: 16,
  },

  sendButton: {
    backgroundColor: "#0A4D9F",
    width: 50,
    height: 50,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
});
