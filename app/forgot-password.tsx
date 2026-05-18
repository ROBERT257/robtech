import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    try {
      // Adjust endpoint as needed for your backend
      await axios.post('http://127.0.0.1:8000/api/auth/password/reset/', { email });
      setSuccess(true);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email to reset your password</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={Colors.dark.textSecondary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Link</Text>}
      </TouchableOpacity>
      {success && <Text style={styles.success}>Check your email for reset instructions.</Text>}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    padding: 20,
    justifyContent: 'center',
  },
  brand: {
    color: Colors.dark.accent,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.dark.text,
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.dark.card,
    color: Colors.dark.text,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.dark.accent,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: Colors.dark.accent,
    fontSize: 15,
    marginTop: 16,
    textAlign: 'center',
  },
  success: {
    color: '#00D09E',
    fontSize: 15,
    marginTop: 16,
    textAlign: 'center',
  },
});
