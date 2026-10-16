import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Joymee</Text>
      <Text style={styles.hint}>Mobile skeleton — Expo Router ishga tushdi.</Text>
      <Link href="/listings" style={styles.link}>
        E'lonlar →
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#0d1117' },
  brand: { color: '#ff7a1f', fontSize: 36, fontWeight: '800', letterSpacing: -0.5 },
  hint: { color: '#8b96a3', marginTop: 8, textAlign: 'center' },
  link: { color: '#e6edf3', marginTop: 24, fontSize: 16 },
});
