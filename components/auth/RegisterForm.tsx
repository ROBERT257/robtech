import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type RegisterFormVariant = 'standard' | 'onboarding';

interface RegisterFormProps {
  variant: RegisterFormVariant;
}

export default function RegisterForm({ variant }: RegisterFormProps) {
  const { register, login } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  const isOnboarding = variant === 'onboarding';

  const getDuplicateMessage = (message: string) => {
    const lowerMessage = message.toLowerCase();
    return (
      lowerMessage.includes('username already exists') ||
      lowerMessage.includes('username already exist') ||
      lowerMessage.includes('user with that username already exists') ||
      lowerMessage.includes('phone number already exists')
    );
  };

  const handleRegister = async () => {
    const cleanPhone = phone.trim();
    const cleanUsername = isOnboarding ? cleanPhone.replace(/[^0-9]/g, '') : username.trim();
    const cleanEmail = isOnboarding ? `${cleanUsername}@example.com` : email.trim();

    if (isOnboarding) {
      if (!fullName || !cleanPhone || !password || !confirmPassword) {
        Alert.alert('Please fill all fields');
        return;
      }
    } else if (!cleanUsername || !cleanEmail || !cleanPhone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!cleanUsername) {
      Alert.alert('Invalid phone number', 'Enter a valid phone number with digits.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(cleanUsername, cleanEmail, password, cleanPhone, referralCode || undefined);

      if (isOnboarding) {
        router.replace(`/onboarding/payment?phone=${encodeURIComponent(cleanPhone)}`);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      const message = error?.message || 'An error occurred during registration';

      if (isOnboarding && getDuplicateMessage(String(message))) {
        try {
          await login(cleanUsername, password);
          router.replace(`/onboarding/payment?phone=${encodeURIComponent(cleanPhone)}`);
          return;
        } catch (loginError: any) {
          Alert.alert(
            'Account already exists',
            loginError?.message || 'An account with this phone number already exists. Please log in instead.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Go to Login', onPress: () => router.push('/login') },
            ]
          );
          return;
        }
      }

      if (!isOnboarding && getDuplicateMessage(String(message))) {
        Alert.alert('Account already exists', 'This account already exists. Please log in instead.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Login', onPress: () => router.push('/login') },
        ]);
        return;
      }

      Alert.alert('Registration Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Rotech</Text>
      <Text style={styles.subtitle}>{isOnboarding ? 'Create your account' : 'Create your account'}</Text>

      <View style={styles.form}>
        {isOnboarding ? (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor={Colors.dark.textSecondary}
            value={fullName}
            onChangeText={setFullName}
          />
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={Colors.dark.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        )}

        {!isOnboarding ? (
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.dark.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Phone"
          placeholderTextColor={Colors.dark.textSecondary}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.dark.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor={Colors.dark.textSecondary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Referral Code (Optional)"
          placeholderTextColor={Colors.dark.textSecondary}
          value={referralCode}
          onChangeText={setReferralCode}
          autoCapitalize="characters"
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isOnboarding ? 'Continue to Payment' : 'Register'}</Text>}
        </TouchableOpacity>

        {!isOnboarding ? (
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        )}
      </View>
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
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.dark.text,
    fontSize: 18,
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: Colors.dark.card,
    color: Colors.dark.text,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  button: {
    backgroundColor: Colors.dark.accent,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: Colors.dark.accent,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
});