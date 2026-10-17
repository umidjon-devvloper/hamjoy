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
                    <Text style={[styles.bubbleTime, mine && { color: 'rgba(255,255,255,0.7)' }]}>
                      {new Date(item.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
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
  bubbleTime: { alignSelf: 'flex-end', fontSize: 10, color: colors.muted },
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
});
