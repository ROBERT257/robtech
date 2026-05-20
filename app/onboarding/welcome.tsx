import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start Investing in Crypto Securely</Text>
      <Text style={styles.subtitle}>
        Join thousands of Kenyans using secure, simple crypto investing. Fast signup with M‑Pesa.
      </Text>

      <TouchableOpacity style={styles.cta} onPress={() => router.push('/onboarding/register')}>
        <Text style={styles.ctaText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#0B0F19' },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  subtitle: { color: '#ccc', fontSize: 14, marginBottom: 24 },
  cta: { backgroundColor: '#1DB954', padding: 14, borderRadius: 12, alignItems: 'center' },
  ctaText: { color: '#001214', fontWeight: '700' },
});
