import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { initiatePayment } from '../../services/wallet';

const MPESA_TEST_PHONE = process.env.EXPO_PUBLIC_MPESA_TEST_PHONE?.trim() || '';

export default function PaymentStep() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [phone, setPhone] = useState((params?.phone as string) || user?.phone || MPESA_TEST_PHONE || '');
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => value.replace(/\s+/g, '').replace(/(?!^\+)[^\d]/g, '');

  const onPay = async () => {
    if (!phone) return Alert.alert('Phone is required');
    setLoading(true);
    try {
      const { paymentId } = await initiatePayment(formatPhone(phone), 300);
      router.replace(`/onboarding/waiting?paymentId=${encodeURIComponent(paymentId)}`);
    } catch (err: any) {
      Alert.alert('Payment initiation failed', err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/0/03/M-Pesa_Logo.png' }} style={{ width: 120, height: 36, resizeMode: 'contain' }} />
      </View>
      <Text style={styles.title}>Activation: KES 300</Text>
      <Text style={styles.subtitle}>M-Pesa payment. The backend will route this request through the M-Pesa sandbox.</Text>

      <TextInput placeholder="Phone (07...)" placeholderTextColor="#666" style={styles.input} value={phone} onChangeText={(value) => setPhone(formatPhone(value))} keyboardType="phone-pad" />

      <Text style={styles.helperText}>Test phone: {MPESA_TEST_PHONE || 'set EXPO_PUBLIC_MPESA_TEST_PHONE in .env'}</Text>

      <TouchableOpacity style={styles.cta} onPress={onPay} disabled={loading}>
        <Text style={styles.ctaText}>{loading ? 'Processing...' : 'Continue to payment'}</Text>
      </TouchableOpacity>
      <View style={{ marginTop: 12 }}>
        <Text style={{ color: '#ccc', fontSize: 12 }}>Secure test payment • Encrypted • No card required</Text>
      </View>
      <View style={styles.badgesRow}>
        <Text style={styles.badge}>M-Pesa mode</Text>
        <Text style={styles.badge}>M-Pesa sandbox</Text>
        <Text style={styles.badge}>No real money</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#0B0F19' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#ccc', fontSize: 13, marginBottom: 12 },
  input: { backgroundColor: '#11141a', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 12 },
  helperText: { color: '#8CA0C4', fontSize: 12, marginBottom: 12 },
  cta: { backgroundColor: '#004AAD', padding: 14, borderRadius: 12, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '700' },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  badge: { color: '#fff', backgroundColor: '#1B2230', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginRight: 8, marginTop: 8, fontSize: 12 },
});
