import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterStep() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!fullName || !phone || !password) {
      Alert.alert('Please fill all fields');
      return;
    }
    try {
      setLoading(true);
      const cleanPhone = phone.trim();
      const username = cleanPhone.replace(/[^0-9]/g, '');
      await register(username, `${username}@example.com`, password, phone);
      router.replace(`/onboarding/payment?phone=${encodeURIComponent(cleanPhone)}`);
    } catch (err: any) {
      Alert.alert('Registration failed', err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>
      <TextInput placeholder="Full name" placeholderTextColor="#666" style={styles.input} value={fullName} onChangeText={setFullName} />
      <TextInput placeholder="Phone (e.g. 07... )" placeholderTextColor="#666" style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput placeholder="Password" placeholderTextColor="#666" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.cta} onPress={onSubmit} disabled={loading}>
        <Text style={styles.ctaText}>{loading ? 'Creating...' : 'Continue to Payment'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#0B0F19' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { backgroundColor: '#11141a', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 12 },
  cta: { backgroundColor: '#1DB954', padding: 14, borderRadius: 12, alignItems: 'center' },
  ctaText: { color: '#001214', fontWeight: '700' },
});
