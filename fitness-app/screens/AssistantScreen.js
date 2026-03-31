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
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../services/api';
import { styles } from './styles/AssistantScreen.styles';

const AssistantScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'welcome',
      sender: 'bot',
      timestamp: new Date(new Date().setHours(13, 12, 0)),
    },
    {
      id: '2',
      text: "What are some quick nutrition tips for post-workout recovery? I'm doing heavy lifting today.",
      sender: 'user',
      timestamp: new Date(new Date().setHours(13, 13, 0)),
    },
    {
      id: '3',
      type: 'recovery_protocol',
      sender: 'bot',
      timestamp: new Date(new Date().setHours(13, 15, 0)),
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleQuickQuestion = (question) => {
    setInputText(question);
  };

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
      const errorText = "Sorry, I'm having trouble connecting right now. Please try again! 🔄";
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

    if (item.type === 'welcome') {
      return (
        <View style={[styles.messageRow, styles.botMessageRow]}>
          <View style={styles.botAvatarContainer}>
            <Icon name="fitness" size={18} color="#fff" />
          </View>
          <View style={styles.bubbleWrapper}>
            <View style={[styles.messageBubble, styles.botBubble]}>
              <Text style={[styles.messageText, styles.botText]}>
                Hello! 👋 I'm your Kinetic Coach. Ready to push your limits today? I can help you with:
              </Text>
              <View style={styles.actionPillsContainer}>
                <TouchableOpacity style={styles.actionPill} onPress={() => handleQuickQuestion('Best cardio exercises?')}>
                  <View style={styles.actionPillIconContainer}><Text style={styles.actionPillIcon}>🏃‍♂️</Text></View>
                  <Text style={styles.actionPillText}>Best cardio exercises?</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionPill} onPress={() => handleQuickQuestion('Nutrition tips')}>
                  <View style={styles.actionPillIconContainer}><Text style={styles.actionPillIcon}>🥗</Text></View>
                  <Text style={styles.actionPillText}>Nutrition tips</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionPill} onPress={() => handleQuickQuestion('Performance Analytics')}>
                  <View style={styles.actionPillIconContainer}><Text style={styles.actionPillIcon}>📊</Text></View>
                  <Text style={styles.actionPillText}>Performance Analytics</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.timestampContainer}>
              <Text style={styles.botTimestamp}>{formatTime(item.timestamp)}</Text>
            </View>
          </View>
        </View>
      );
    }

    if (item.type === 'recovery_protocol') {
      return (
        <View style={[styles.messageRow, styles.botMessageRow]}>
          <View style={styles.botAvatarContainer}>
            <Icon name="fitness" size={18} color="#fff" />
          </View>
          <View style={styles.bubbleWrapper}>
            <View style={[styles.messageBubble, styles.botBubble]}>
              <View style={styles.protocolContainer}>
                <Text style={styles.protocolTitle}>RECOVERY PROTOCOL</Text>
                
                <View style={styles.protocolItem}>
                  <View style={styles.protocolIconWrapper}>
                    <Icon name="restaurant" size={20} color="#a43609" />
                  </View>
                  <View style={styles.protocolItemContent}>
                    <Text style={styles.protocolItemTitle}>Protein Synthesis</Text>
                    <Text style={styles.protocolItemDesc}>
                      Consume 20-30g of high-quality protein within 45 minutes of finishing your session to repair muscle fibers.
                    </Text>
                  </View>
                </View>

                <View style={styles.protocolItem}>
                  <View style={styles.protocolIconWrapper}>
                    <Icon name="water" size={20} color="#a43609" />
                  </View>
                  <View style={styles.protocolItemContent}>
                    <Text style={styles.protocolItemTitle}>Glycogen Replenishment</Text>
                    <Text style={styles.protocolItemDesc}>
                      Pair your protein with fast-acting carbohydrates (like a banana or oats) to restore energy levels.
                    </Text>
                  </View>
                </View>

                <View style={styles.protocolQuote}>
                  <Text style={styles.protocolQuoteText}>
                    "Heavy lifting demands high-octane fuel. Focus on whole foods and immediate rehydration for peak performance tomorrow."
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.timestampContainer}>
              <Text style={styles.botTimestamp}>{formatTime(item.timestamp)}</Text>
            </View>
          </View>
        </View>
      );
    }

    // Standard text message
    return (
      <View style={[styles.messageRow, isBot ? styles.botMessageRow : styles.userMessageRow]}>
        {isBot && (
          <View style={styles.botAvatarContainer}>
            <Icon name="fitness" size={18} color="#fff" />
          </View>
        )}
        <View style={styles.bubbleWrapper}>
          <View style={[styles.messageBubble, isBot ? styles.botBubble : styles.userBubble]}>
            <Text style={[styles.messageText, isBot ? styles.botText : styles.userText]}>
              {item.text}
            </Text>
          </View>
          <View style={styles.timestampContainer}>
            <Text style={isBot ? styles.botTimestamp : styles.userTimestamp}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
        {!isBot && (
          <View style={styles.userAvatarContainer}>
            <Icon name="person" size={18} color="#a8a29e" />
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2c2f31" />
        </TouchableOpacity>
        
        <View style={styles.headerIcon}>
          <Icon name="fitness" size={22} color="#fff" />
        </View>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>FITNESS AI</Text>
          <Text style={styles.statusText}>AI Coach Active</Text>
        </View>
        
        <View style={styles.headerActions}>
          <Icon name="notifications-outline" size={24} color="#a8a29e" />
          <Icon name="ellipsis-vertical" size={24} color="#a8a29e" />
        </View>
      </View>

      {/* Messages */}
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />

        {loading && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 24, marginBottom: 16 }}>
            <ActivityIndicator size="small" color="#ff794a" />
            <Text style={{ marginLeft: 8, fontSize: 12, color: '#a8a29e', fontWeight: '600' }}>AI is thinking...</Text>
          </View>
        )}
      </View>

      {/* Footer Input Area */}
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="add" size={24} color="#78716c" />
        </TouchableOpacity>
        
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Message your coach..."
            placeholderTextColor="#a8a29e"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!loading}
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || loading) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            <Icon name="send" size={18} color="#fff" style={{ marginLeft: 2, marginTop: 2 }} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.iconButton}>
          <Icon name="mic" size={24} color="#78716c" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AssistantScreen;
