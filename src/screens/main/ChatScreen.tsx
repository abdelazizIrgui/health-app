import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { CHAT_API_URL } from '../../config';
import { useCycle } from '../../context/CycleContext';
import { useUser } from '../../context/UserContext';
import { useI18n } from '../../i18n/I18nContext';
import { cardShadow, colors } from '../../theme';
import { ChatContext, ChatMessage, MAX_INPUT_CHARS, buildPayload, clampInput } from '../../utils/chat';
import { requestReply } from '../../utils/chatApi';
import { getCycleProfile } from '../../utils/cycleFromAnswers';
import { buildForecast } from '../../utils/forecast';

const CONSENT_KEY = '@health_app/chat_consent';
const SUGGESTIONS = ['chat.suggest.1', 'chat.suggest.2', 'chat.suggest.3', 'chat.suggest.4'];

interface Consent {
  accepted: boolean;
  shareCycle: boolean;
}

let nextId = 1;
const newId = () => `m${Date.now()}-${nextId++}`;

/** A ChatGPT-style conversation where she can ask questions about her cycle. */
export default function ChatScreen() {
  const navigation = useNavigation();
  const { t, dir, language } = useI18n();
  const { answers } = useUser();
  const { periods } = useCycle();
  const insets = useSafeAreaInsets();
  const text = { textAlign: dir.align, writingDirection: dir.writing } as const;

  const [consent, setConsent] = useState<Consent | null | undefined>(undefined); // undefined = loading
  const [shareCycle, setShareCycle] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CONSENT_KEY);
        const saved = raw ? (JSON.parse(raw) as Consent) : null;
        setConsent(saved?.accepted ? saved : null);
      } catch {
        setConsent(null);
      }
    })();
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const goBack = () => navigation.goBack();

  const accept = async () => {
    const value: Consent = { accepted: true, shareCycle };
    setConsent(value);
    try {
      await AsyncStorage.setItem(CONSENT_KEY, JSON.stringify(value));
    } catch (e) {
      console.warn('Could not save the chat choice', e);
    }
  };

  // Only a few non-identifying facts about the cycle, and only if she allowed it.
  const buildContext = (): ChatContext | undefined => {
    if (!consent?.shareCycle) return undefined;
    const profile = getCycleProfile(answers);
    if (!profile.ready) return undefined;
    const f = buildForecast(periods, profile.settings);
    if (!f) return undefined;
    return { cycleDay: f.day, cycleLength: f.cycleLength, phase: f.phase, onPeriod: f.onPeriod };
  };

  const ask = async (history: ChatMessage[]) => {
    setSending(true);
    setFailed(false);
    try {
      const reply = await requestReply(CHAT_API_URL, buildPayload(history, language, buildContext()));
      setMessages((m) => [...m, { id: newId(), role: 'assistant', content: reply }]);
    } catch (e) {
      console.warn('Chat request failed', e);
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  const send = (raw?: string) => {
    const content = clampInput(raw ?? input);
    if (!content || sending || !CHAT_API_URL) return;
    const next = [...messages, { id: newId(), role: 'user' as const, content }];
    setMessages(next);
    setInput('');
    ask(next);
  };

  const newChat = () => {
    setMessages([]);
    setFailed(false);
    setInput('');
  };

  const scrollDown = () => scrollRef.current?.scrollToEnd({ animated: true });

  // ---------- header ----------
  const header = (
    <View style={[styles.header, { flexDirection: dir.row }]}>
      <TouchableOpacity
        style={styles.roundButton}
        onPress={goBack}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
      >
        <Ionicons
          name={dir.row === 'row' ? 'chevron-back' : 'chevron-forward'}
          size={22}
          color={colors.rose}
        />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{t('chat.title')}</Text>
        <Text style={styles.headerSub}>{t('chat.disclaimer')}</Text>
      </View>
      {consent && messages.length > 0 ? (
        <TouchableOpacity
          style={styles.roundButton}
          onPress={newChat}
          accessibilityRole="button"
          accessibilityLabel={t('chat.newChat')}
        >
          <Ionicons name="create-outline" size={22} color={colors.rose} />
        </TouchableOpacity>
      ) : (
        <View style={styles.roundSpacer} />
      )}
    </View>
  );

  if (consent === undefined) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        {header}
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.rose} />
      </SafeAreaView>
    );
  }

  // ---------- first time: she must agree before anything is sent ----------
  if (consent === null) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {header}
        <ScrollView contentContainerStyle={styles.consentContent}>
          <View style={styles.consentIcon}>
            <Ionicons name="shield-checkmark" size={36} color={colors.rose} />
          </View>
          <Text style={[styles.consentTitle, { textAlign: 'center' }]}>{t('chat.consent.title')}</Text>
          <Text style={[styles.consentBody, text]}>{t('chat.consent.body')}</Text>

          <View style={[styles.switchRow, { flexDirection: dir.row }]}>
            <Text style={[styles.switchLabel, text]}>{t('chat.consent.shareCycle')}</Text>
            <Switch
              value={shareCycle}
              onValueChange={setShareCycle}
              trackColor={{ true: colors.rose, false: undefined }}
            />
          </View>

          <TouchableOpacity style={styles.primary} activeOpacity={0.85} onPress={accept}>
            <Text style={styles.primaryText}>{t('chat.consent.accept')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={goBack}>
            <Text style={styles.secondaryText}>{t('chat.consent.decline')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---------- the conversation ----------
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {header}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollDown}
        >
          {!CHAT_API_URL && (
            <View style={styles.notice}>
              <Text style={[styles.noticeText, text]}>{t('chat.notConfigured')}</Text>
            </View>
          )}

          {messages.length === 0 && (
            <View>
              <View style={[styles.bubble, styles.bubbleBot]}>
                <Text style={[styles.botText, text]}>{t('chat.welcome')}</Text>
              </View>
              <View style={styles.chips}>
                {SUGGESTIONS.map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.chip}
                    activeOpacity={0.8}
                    onPress={() => send(t(key))}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.chipText, text]}>{t(key)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {messages.map((m) => (
            <View
              key={m.id}
              style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}
            >
              <Text style={[m.role === 'user' ? styles.userText : styles.botText, text]} selectable>
                {m.content}
              </Text>
            </View>
          ))}

          {sending && (
            <View style={[styles.bubble, styles.bubbleBot, styles.typing]}>
              <ActivityIndicator size="small" color={colors.rose} />
            </View>
          )}

          {failed && !sending && (
            <View style={[styles.bubble, styles.bubbleBot]}>
              <Text style={[styles.botText, text]}>{t('chat.error')}</Text>
              <TouchableOpacity onPress={() => ask(messages)} accessibilityRole="button">
                <Text style={[styles.retry, text]}>{t('chat.retry')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <View
          style={[
            styles.inputBar,
            { flexDirection: dir.row, paddingBottom: keyboardOpen ? 8 : Math.max(insets.bottom, 8) },
          ]}
        >
          <TextInput
            style={[styles.input, text]}
            value={input}
            onChangeText={setInput}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={colors.muted}
            multiline
            maxLength={MAX_INPUT_CHARS}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || sending || !CHAT_API_URL) && styles.sendOff]}
            disabled={!input.trim() || sending || !CHAT_API_URL}
            onPress={() => send()}
            accessibilityRole="button"
            accessibilityLabel={t('chat.send')}
          >
            <Ionicons name="arrow-up" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },

  header: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    ...cardShadow,
  },
  roundSpacer: { width: 44, height: 44 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  headerSub: { marginTop: 2, fontSize: 11, color: colors.muted, textAlign: 'center' },

  messages: { paddingHorizontal: 16, paddingVertical: 12, gap: 10, flexGrow: 1 },
  bubble: { maxWidth: '85%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  bubbleBot: { alignSelf: 'flex-start', backgroundColor: colors.white, ...cardShadow },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: colors.rose },
  botText: { fontSize: 15, lineHeight: 23, color: colors.text },
  userText: { fontSize: 15, lineHeight: 23, color: colors.white },
  typing: { paddingHorizontal: 20 },
  retry: { marginTop: 8, fontSize: 14, fontWeight: '700', color: colors.rose },

  chips: { marginTop: 14, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.peach,
    backgroundColor: colors.peachSoft,
  },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.text },

  notice: { padding: 12, borderRadius: 14, backgroundColor: colors.lilacSoft, marginBottom: 10 },
  noticeText: { fontSize: 13, lineHeight: 20, color: colors.text },

  inputBar: {
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 22,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.cream,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.rose,
  },
  sendOff: { backgroundColor: colors.peach },

  consentContent: { padding: 24, alignItems: 'stretch' },
  consentIcon: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.peachSoft,
    marginBottom: 16,
  },
  consentTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12 },
  consentBody: { fontSize: 15, lineHeight: 24, color: colors.text },
  switchRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.white,
  },
  switchLabel: { flex: 1, fontSize: 14, color: colors.text },
  primary: {
    marginTop: 24,
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.rose,
  },
  primaryText: { fontSize: 16, fontWeight: '700', color: colors.white },
  secondary: { marginTop: 8, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 15, fontWeight: '600', color: colors.muted },
});