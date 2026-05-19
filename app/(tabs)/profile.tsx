
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Referral {
  id: string;
  referred_username: string;
  reward_amount: string;
  status: string;
  paid_at: string | null;
}

export default function ProfileScreen() {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Referral state
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralError, setReferralError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/profile/`, {
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
    // Fetch referrals
    const fetchReferrals = async () => {
      setReferralLoading(true);
      setReferralError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/referrals/made/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReferrals(res.data.filter((r: Referral) => r.status === 'approved' || r.status === 'paid'));
      } catch (e: any) {
        setReferralError('Failed to load referrals');
      } finally {
        setReferralLoading(false);
      }
    };
    if (token) fetchReferrals();
  }, [token]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Ionicons name="person-circle" size={60} color="#7ed957" style={{ marginRight: 12 }} />
        <View>
          <Text style={styles.title}>{profile?.username || 'Profile'}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : profile ? (
        <>
          <View style={styles.profileCard}>
            <View style={styles.infoRow}><Ionicons name="card" size={20} color="#7ed957" /><Text style={styles.infoLabel}>Wallet Balance:</Text><Text style={styles.infoValue}>{profile.wallet_balance} RT</Text></View>
            <View style={styles.infoRow}><Ionicons name="key" size={20} color="#7ed957" /><Text style={styles.infoLabel}>Referral Code:</Text><Text style={styles.infoValue}>{profile.referral_code || 'N/A'}</Text></View>
            <View style={styles.infoRow}><Ionicons name="checkmark-circle" size={20} color="#7ed957" /><Text style={styles.infoLabel}>Registered:</Text><Text style={styles.infoValue}>{profile.is_registered ? 'Yes' : 'No'}</Text></View>
            <View style={styles.infoRow}><Ionicons name="shield-checkmark" size={20} color="#7ed957" /><Text style={styles.infoLabel}>Verified:</Text><Text style={styles.infoValue}>{profile.is_verified ? 'Yes' : 'No'}</Text></View>
          </View>

          {/* Referral Reward Section - always visible */}
          <View style={styles.referralSection}>
            <Text style={styles.referralTitle}>Referral Rewards</Text>
            {referralLoading ? (
              <ActivityIndicator color="#7ed957" style={{ marginTop: 8 }} />
            ) : referralError ? (
              <Text style={styles.error}>{referralError}</Text>
            ) : (
              <>
                {referrals.length > 0 ? (
                  <>
                    <Text style={styles.referralMsg}>
                      🎉 You have successfully referred {referrals.length} user{referrals.length > 1 ? 's' : ''}!
                    </Text>
                    {referrals.map(ref => (
                      <View key={ref.id} style={styles.referralCard}>
                        <Text style={styles.referralText}>
                          {ref.referred_username} registered — You earned <Text style={{color:'#7ed957'}}>+150 RT</Text> {ref.status === 'paid' ? '(Paid)' : '(Pending payout)'}
                        </Text>
                      </View>
                    ))}
                  </>
                ) : null}
                <Text style={styles.referralNote}>Each successful referral pays you 150 RT instantly when your friend registers.</Text>
                {referrals.length === 0 && (
                  <Text style={styles.referralMsg}>Refer a friend and earn 150 RT instantly when they register!</Text>
                )}
              </>
            )}
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              Alert.alert('Logout', 'Are you sure you want to logout?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: () => logout(router) },
              ]);
            }}
          >
            <Ionicons name="log-out-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  content: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'stretch',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  email: {
    color: '#7A869A',
    fontSize: 15,
    marginTop: 2,
  },
  profileCard: {
    backgroundColor: '#1a2233',
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    color: '#7ed957',
    fontWeight: 'bold',
    marginLeft: 8,
    marginRight: 4,
    fontSize: 15,
  },
  infoValue: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 4,
  },
  referralSection: {
    backgroundColor: '#16202e',
    borderRadius: 14,
    padding: 18,
    marginBottom: 8,
  },
  referralTitle: {
    color: '#7ed957',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  referralMsg: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 15,
  },
  referralCard: {
    backgroundColor: '#1a2233',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  referralText: {
    color: '#fff',
    fontSize: 15,
  },
  referralNote: {
    color: '#7ed957',
    marginTop: 8,
    fontSize: 13,
    fontStyle: 'italic',
  },
  error: { color: 'red', marginTop: 16 },
  logoutButton: {
    backgroundColor: '#FF4B4B',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});