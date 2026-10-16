import { StyleSheet, Text, View } from 'react-native';

export default function Listings() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>E'lonlar</Text>
      <Text style={styles.hint}>SDK orqali backend ulanadi (Faza 4).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#0d1117' },
  title: { color: '#e6edf3', fontSize: 24, fontWeight: '700' },
  hint: { color: '#8b96a3', marginTop: 8 },
});
