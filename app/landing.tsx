import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function LandingPage() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#0f2027", "#2c5364"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.heroCard}>
        <Image source={require('../assets/images/icon.png')} style={styles.logo} />
        <Text style={styles.headline}>Invest in Crypto, Effortlessly</Text>
        <Text style={styles.description}>
          The modern platform for mobile crypto investing. Secure, fast, and beautifully simple.
        </Text>
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/register')}>
            <Text style={styles.ctaText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ctaButton, styles.ctaSecondary]} onPress={() => router.push('/login')}>
            <Text style={[styles.ctaText, styles.ctaTextSecondary]}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.footer}>© {new Date().getFullYear()} CryptoApp. All rights reserved.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    width: width * 0.9,
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
    marginBottom: 40,
    backdropFilter: 'blur(12px)',
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  description: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  ctaButton: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginHorizontal: 8,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
  ctaSecondary: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: '#fff',
  },
  ctaText: {
    color: '#2c5364',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ctaTextSecondary: {
    color: '#fff',
  },
  footer: {
    color: '#e0e0e0',
    fontSize: 12,
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    opacity: 0.7,
  },
});
