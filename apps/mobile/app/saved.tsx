import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeTile } from '@/components/cards';
import { Button, EmptyState, ScreenHeader } from '@/components/ui';
import { useHomes } from '@/lib/data';
import { useSaved } from '@/lib/saved';
import { colors } from '@/lib/theme';

export default function Saved() {
  const router = useRouter();
  const { ids } = useSaved();
  const { data } = useHomes();
  const saved = (data ?? []).filter((h) => ids.includes(h.id));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={saved}
        keyExtractor={(h) => h.id}
        ListHeaderComponent={
          <View style={{ marginHorizontal: -20 }}>
            <ScreenHeader title="Saqlanganlar" subtitle={saved.length ? `${saved.length} ta eʼlon` : undefined} />
          </View>
        }
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        renderItem={({ item }) => <HomeTile home={item} />}
        ListEmptyComponent={
          <EmptyState icon="heart" title="Hali hech narsa saqlanmagan" text="Yoqqan eʼlonlardagi yurakchani bosing — ular shu yerda turadi.">
            <Button label="Eʼlonlarni koʻrish" tone="green" size="md" style={{ marginTop: 10 }} onPress={() => router.push('/search')} />
          </EmptyState>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
});
