import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { aiAPI } from '../services/api';
import { styles } from './styles/AssistantScreen.styles';

const AssistantScreen = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: `Hi ${user?.firstName || 'there'}! 👋 I'm your AI Fitness Assistant. I can help you with:\n\n💪 Workout advice\n🥗 Nutrition tips\n🏃 Exercise form\n📊 Fitness goals\n💡 Training plans\n\nWhat would you like to know?`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Call backend AI chat API
      const response = await aiAPI.chat(inputText.trim());
      
      if (response.data.success && response.data.response) {
        const botResponse = {
          id: (Date.now() + 1).toString(),
          text: response.data.response,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
      } else {
        throw new Error(response.data.error || 'Failed to get response from AI');
      }
    } catch (error) {
      console.error('Chat error:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      let errorText = "Sorry, I'm having trouble connecting right now. Please try again! 🔄";
      
      // Provide more specific error messages
      const errorMsg = error.response?.data?.error || error.message || '';
      
      if (errorMsg.includes('API key') || errorMsg.includes('not configured')) {
        errorText = "AI service is not configured properly. Please contact support. 🔑";
      } else if (errorMsg.includes('quota')) {
        errorText = "AI service quota exceeded. Please try again later. ⏰";
      } else if (errorMsg.includes('network') || error.message.includes('Network')) {
        errorText = "Network error. Please check your internet connection. 📡";
      } else if (errorMsg.includes('Unauthorized') || errorMsg.includes('401')) {
        errorText = "Session expired. Please log in again. 🔐";
      }
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isBot = item.sender === 'bot';
    return (
      <View
        style={[
          styles.messageContainer,
          isBot ? styles.botMessageContainer : styles.userMessageContainer,
        ]}
      >
        {isBot && (
          <View style={styles.botAvatar}>
            <Icon name="fitness" size={20} color="#fff" />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isBot ? styles.botBubble : styles.userBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isBot ? styles.botText : styles.userText,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              isBot ? styles.botTimestamp : styles.userTimestamp,
            ]}
          >
            {item.timestamp.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        {!isBot && (
          <View style={styles.userAvatar}>
            <Icon name="person" size={20} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  const quickQuestions = [
    { id: '1', text: '💪 How to build muscle?', icon: 'barbell' },
    { id: '2', text: '🏃 Best cardio exercises?', icon: 'bicycle' },
    { id: '3', text: '🥗 Nutrition tips?', icon: 'nutrition' },
    { id: '4', text: '📊 Create workout plan?', icon: 'calendar' },
  ];

  const handleQuickQuestion = (question) => {
    setInputText(question);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Icon name="fitness" size={28} color="#ffffffff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>AI Fitness Assistant</Text>
            <View style={styles.statusContainer}>
              <View style={styles.onlineIndicator} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <View style={styles.quickQuestionsContainer}>
          <Text style={styles.quickQuestionsTitle}>Quick Questions:</Text>
          <View style={styles.quickQuestionsGrid}>
            {quickQuestions.map((q) => (
              <TouchableOpacity
                key={q.id}
                style={styles.quickQuestionButton}
                onPress={() => handleQuickQuestion(q.text)}
              >
                <Icon name={q.icon} size={20} color="#ffffffff" />
                <Text style={styles.quickQuestionText}>{q.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#ffffffff" />
          <Text style={styles.loadingText}>AI is thinking...</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask about fitness, nutrition, workouts..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!loading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || loading) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            <Icon
              name="send"
              size={20}
              color={!inputText.trim() || loading ? '#ccc' : '#fff'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AssistantScreen;
