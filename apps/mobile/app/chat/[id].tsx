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
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/lib/auth';
import { colors, radius, spacing } from '@/lib/theme';

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
  const router = useRouter();
  const { me } = useAuth();
  const myId = me?.user.id;
  const listRef = useRef<FlatList<Msg>>(null);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

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
      cleanup = () => {
        socket.emit('chat:unsubscribe', id);
        socket.off('chat:message', onMessage);
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Suhbat</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
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
            renderItem={({ item }) => {
              const mine = item.senderId === myId;
              return (
                <View style={[styles.msgRow, mine ? styles.msgRowMine : styles.msgRowTheirs]}>
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.body}</Text>
                  </View>
                </View>
              );
            }}
          />
          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Xabar yozing…"
              placeholderTextColor={colors.dim}
              style={styles.composerInput}
              multiline
            />
            <Pressable
              style={({ pressed }) => [styles.sendBtn, (pressed || sending) && { opacity: 0.6 }]}
              onPress={send}
              disabled={sending || !draft.trim()}
            >
              <Text style={styles.sendText}>➤</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: spacing.lg,
  },
  back: { color: colors.fg, fontSize: 24 },
  headerTitle: { color: colors.fg, fontSize: 17, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messages: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },
  msgRow: { flexDirection: 'row' },
  msgRowMine: { justifyContent: 'flex-end' },
  msgRowTheirs: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.lg,
  },
  bubbleMine: { backgroundColor: colors.accent, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.line },
  bubbleText: { color: colors.fg, fontSize: 15, lineHeight: 20 },
  bubbleTextMine: { color: colors.bg },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
  },
  composerInput: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.fg,
    fontSize: 15,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: colors.bg, fontSize: 18, fontWeight: '700' },
});
