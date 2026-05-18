
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { token, user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/auth/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (e: any) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : profile ? (
        <>
          <View style={styles.profileCard}>
            <Text style={styles.label}>Username:</Text>
            <Text style={styles.value}>{profile.username}</Text>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{profile.email}</Text>
            <Text style={styles.label}>Referral Code:</Text>
            <Text style={styles.value}>{profile.referral_code || 'N/A'}</Text>
            <Text style={styles.label}>Wallet Balance:</Text>
            <Text style={styles.value}>{profile.wallet_balance} RT</Text>
            <Text style={styles.label}>Registered:</Text>
            <Text style={styles.value}>{profile.is_registered ? 'Yes' : 'No'}</Text>
            <Text style={styles.label}>Verified:</Text>
            <Text style={styles.value}>{profile.is_verified ? 'Yes' : 'No'}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              Alert.alert('Logout', 'Are you sure you want to logout?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout },
              ]);
            }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 12,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: '#1a2233',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    marginTop: 16,
  },
  label: { color: '#7ed957', fontWeight: 'bold', marginTop: 8 },
  value: { color: '#fff', fontSize: 16 },
  error: { color: 'red', marginTop: 16 },
  logoutButton: {
    backgroundColor: '#FF4B4B',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});