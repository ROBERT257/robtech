import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

export default function SuccessStep() {
  const router = useRouter();
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.95, duration: 600, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.emoji, { transform: [{ scale }] }]}>🎉</Animated.Text>
      <Text style={styles.title}>You're activated</Text>
      <Text style={styles.subtitle}>Welcome! Your account is now active. Start exploring the dashboard.</Text>
      <TouchableOpacity style={styles.cta} onPress={() => router.replace('/landing')}>
        <Text style={styles.ctaText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F19' },
  emoji: { fontSize: 56 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 12 },
  subtitle: { color: '#ccc', fontSize: 14, textAlign: 'center', marginTop: 8, maxWidth: 320 },
  cta: { marginTop: 24, backgroundColor: '#1DB954', padding: 12, borderRadius: 10 },
  ctaText: { color: '#001214', fontWeight: '700' },
});
