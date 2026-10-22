import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/lib/auth';
import { Avatar, BackButton, Icon } from '@/components/ui';
import { colors } from '@/lib/theme';

interface Msg {
  id: string;
  chatId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

export default function ChatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { me } = useAuth();
  const myId = me?.user.id;
  const listRef = useRef<FlatList<Msg>>(null);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const typingHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingEmitAt = useRef(0);
  const socketRef = useRef<Awaited<ReturnType<typeof getSocket>> | null>(null);

  const { data: chats } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => (await getApi().chats.list()) as unknown as { id: string; listing: { title: string } | null }[],
  });

  const { data, isLoading } = useQuery({
    queryKey: ['chat', id, 'messages'],
    queryFn: async () => {
      const res = (await getApi().chats.messages(id)) as unknown as { items: Msg[]; cursor: string | null };
      return res.items;
    },
  });

  useEffect(() => {
    if (data) setMessages(data);
  }, [data]);

  useEffect(() => {
    if (!id) return;
    let cleanup = () => {};
    let active = true;

    void (async () => {
      const socket = await getSocket();
      if (!socket || !active) return;
      const sub = () => socket.emit('chat:subscribe', id);
      if (socket.connected) sub();
      else socket.once('connect', sub);

      const onMessage = (payload: Msg) => {
        if (payload.chatId !== id) return;
        setMessages((prev) =>
          prev.some((m) => m.id === payload.id) ? prev : [...prev, payload],
        );
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
      };
      socket.on('chat:message', onMessage);

      const onRead = (payload: { chatId: string; readerId: string; readAt: string }) => {
        if (payload.chatId !== id) return;
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId !== payload.readerId && !m.readAt && m.createdAt <= payload.readAt
              ? { ...m, readAt: payload.readAt }
              : m,
          ),
        );
      };
      socket.on('chat:read', onRead);

      socketRef.current = socket;
      const onTyping = (payload: { chatId: string; userId: string }) => {
        if (payload.chatId !== id || payload.userId === myId) return;
        setPeerTyping(true);
        if (typingHideTimer.current) clearTimeout(typingHideTimer.current);
        typingHideTimer.current = setTimeout(() => setPeerTyping(false), 3500);
      };
      socket.on('chat:typing', onTyping);

      cleanup = () => {
        socket.emit('chat:unsubscribe', id);
        socket.off('chat:message', onMessage);
        socket.off('chat:read', onRead);
        socket.off('chat:typing', onTyping);
        if (typingHideTimer.current) clearTimeout(typingHideTimer.current);
      };

      // Mark as read on open
      try {
        await getApi().chats.read(id);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
      cleanup();
    };
  }, [id]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const msg = (await getApi().chats.send(id, body)) as unknown as Msg;
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      setDraft('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    } finally {
      setSending(false);
    }
  };

  const onDraftChange = (next: string) => {
    setDraft(next);
    const now = Date.now();
    if (next.trim() && now - typingEmitAt.current > 1500 && socketRef.current) {
      typingEmitAt.current = now;
      socketRef.current.emit('chat:typing', id);
    }
  };

  const title = chats?.find((c) => c.id === id)?.listing?.title ?? 'Suhbat';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <BackButton />
        <Avatar name={title} size={44} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.headerSub}>Eʼlon boʻyicha suhbat</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.green} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.messages}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.hint}>
                <Text style={styles.hintText}>Salomlashing va eʼlon haqida savol bering. Oldindan pul oʻtkazmang.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const mine = item.senderId === myId;
              return (
                <View style={[styles.msgRow, mine ? styles.msgRowMine : styles.msgRowTheirs]}>
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.body}</Text>
                    <View style={styles.bubbleMeta}>
                      <Text style={[styles.bubbleTime, mine && { color: 'rgba(255,255,255,0.7)' }]}>
                        {new Date(item.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      {mine ? (
                        <Icon
                          name={item.readAt ? 'check-circle' : 'check'}
                          size={12}
                          color={item.readAt ? '#BFE5CC' : 'rgba(255,255,255,0.55)'}
                        />
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            }}
          />
          {peerTyping ? (
            <View style={styles.typingBar}>
              <View style={styles.typingDots}>
                <View style={[styles.typingDot, styles.typingDot1]} />
                <View style={[styles.typingDot, styles.typingDot2]} />
                <View style={[styles.typingDot, styles.typingDot3]} />
              </View>
              <Text style={styles.typingLabel}>yozmoqda…</Text>
            </View>
          ) : null}
          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={onDraftChange}
              placeholder="Xabar yozing…"
              placeholderTextColor={colors.dim}
              style={styles.composerInput}
              multiline
            />
            <Pressable
              accessibilityLabel="Yuborish"
              style={({ pressed }) => [styles.sendBtn, (pressed || sending || !draft.trim()) && { opacity: 0.5 }]}
              onPress={send}
              disabled={sending || !draft.trim()}
            >
              <Icon name="arrow-up" size={20} color={colors.white} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(14,20,17,0.12)',
  },
  headerTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  headerSub: { color: colors.muted, fontSize: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messages: { padding: 16, gap: 8, flexGrow: 1 },
  hint: { alignSelf: 'center', marginTop: 24, padding: 14, borderRadius: 18, backgroundColor: colors.goldWash, maxWidth: 300 },
  hintText: { color: colors.goldInk, fontSize: 13, textAlign: 'center', lineHeight: 18 },
  msgRow: { flexDirection: 'row' },
  msgRowMine: { justifyContent: 'flex-end' },
  msgRowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6, borderRadius: 22, gap: 2 },
  bubbleMine: { backgroundColor: colors.green, borderBottomRightRadius: 6 },
  bubbleTheirs: { backgroundColor: colors.surface, borderBottomLeftRadius: 6 },
  bubbleText: { color: colors.ink, fontSize: 15, lineHeight: 21 },
  bubbleTextMine: { color: colors.white },
  bubbleTime: { fontSize: 10, color: colors.muted },
  bubbleMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  composerInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
    color: colors.ink,
    fontSize: 15,
  },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  typingBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingBottom: 4 },
  typingDots: { flexDirection: 'row', gap: 3 },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.muted, opacity: 0.5 },
  typingDot1: {},
  typingDot2: { opacity: 0.75 },
  typingDot3: { opacity: 1 },
  typingLabel: { fontSize: 12, color: colors.muted, fontStyle: 'italic' },
});
