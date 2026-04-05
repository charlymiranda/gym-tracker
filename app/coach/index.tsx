import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../src/themes/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { AICoachService, ChatMessage } from '../../src/services/ai-service';
import { PreferencesRepository } from '../../src/repositories/extra-repositories';
import { useRouter } from 'expo-router';

export default function CoachScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const db = useSQLiteContext();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has API key configured
    const init = async () => {
      const repo = new PreferencesRepository(db);
      const prefs = await repo.getPreferences();
      
      if (prefs?.gemini_api_key) {
        setApiKey(prefs.gemini_api_key);
        // Push initial greeting
        setMessages([
          { id: '1', role: 'model', text: `¡Bienvenido a tu zona de entrenamiento! 💪\nSoy tu Coach virtual IA.\n\n¿En qué nos enfocamos hoy? ¿Rutina, dudas de alimentación o motivación?` }
        ]);
      } else {
        setMessages([
          { id: 'err', role: 'model', text: 'Para chatear conmigo, necesitas dirigirte a **Ajustes** y pegar tu API Key gratuita de Google Gemini AI Studio. ¡Es súper fácil y rápido! 🚀' }
        ]);
      }
    };
    init();
  }, [db]);

  const handleSend = async () => {
    if (!inputText.trim() || !apiKey || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Scroll down
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    const coachService = new AICoachService(db, apiKey!);
    
    // Pass everything except the welcome greeting if we want clean context, but passing all is fine.
    const AIResponseText = await coachService.generateResponse(userMessage.text, messages.filter(m => m.id !== 'err' && m.id !== '1'));

    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: AIResponseText
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <View style={styles.coachAvatar}>
          <Ionicons name="sparkles" size={24} color={theme.colors.primary} />
        </View>
        <View>
          <Text style={styles.headerTitle}>AI Coach</Text>
          <Text style={styles.headerSub}>Gemini 1.5 Flash</Text>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatArea} 
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <View key={msg.id} style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
              {!isUser && (
                <View style={styles.aiIconBubble}>
                  <Ionicons name="fitness" size={16} color="white" />
                </View>
              )}
              <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>{msg.text}</Text>
            </View>
          );
        })}
        {isTyping && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator color={theme.colors.primary} size="small" />
            <Text style={styles.typingText}>El Coach está pensando...</Text>
          </View>
        )}
      </ScrollView>

      {!apiKey ? (
        <View style={styles.noApiBox}>
          <Pressable style={styles.goToSettingsBtn} onPress={() => router.push('/settings')}>
            <Ionicons name="settings" size={20} color="white" />
            <Text style={styles.goToSettingsText}>Configurar API Key</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.inputArea}>
          <TextInput 
            style={styles.inputField}
            placeholder="Pregúntame sobre tu entreno..."
            placeholderTextColor={theme.colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <Pressable 
            style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]} 
            onPress={handleSend}
            disabled={!inputText.trim() || isTyping}
          >
            <Ionicons name="send" size={20} color="white" />
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: 16, paddingTop: 20, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border, flexDirection: 'row', alignItems: 'center' },
  coachAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  headerSub: { fontSize: 12, color: theme.colors.primary, fontWeight: 'bold' },
  
  chatArea: { flex: 1 },
  messageBubble: { maxWidth: '85%', padding: 14, borderRadius: 18, marginBottom: 16, flexDirection: 'row', flexWrap: 'wrap' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: theme.colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.colors.border },
  aiIconBubble: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 2 },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: 'white' },
  aiText: { color: theme.colors.text, flex: 1 },

  typingIndicator: { flexDirection: 'row', alignItems: 'center', padding: 8, alignSelf: 'flex-start', marginLeft: 16 },
  typingText: { fontSize: 12, color: theme.colors.textSecondary, marginLeft: 8 },

  inputArea: { padding: 12, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border, flexDirection: 'row', alignItems: 'flex-end' },
  inputField: { flex: 1, backgroundColor: theme.colors.background, minHeight: 48, maxHeight: 120, borderRadius: 24, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14, fontSize: 16, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 12, elevation: 1 },

  noApiBox: { padding: 24, backgroundColor: theme.colors.surface, alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.border },
  goToSettingsBtn: { flexDirection: 'row', backgroundColor: theme.colors.text, padding: 16, borderRadius: 32, alignItems: 'center', gap: 10 },
  goToSettingsText: { color: theme.colors.background, fontWeight: 'bold', fontSize: 16 }
});
