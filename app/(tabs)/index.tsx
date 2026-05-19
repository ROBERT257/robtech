import { ActionButtons } from '@/components/ui/ActionButtons';
import { BalanceCard } from '@/components/ui/BalanceCard';
import { ClaimButton } from '@/components/ui/ClaimButton';
import { ClaimCountdown } from '@/components/ui/ClaimCountdown';
import { ClaimHistory } from '@/components/ui/ClaimHistory';
import { MarketList } from '@/components/ui/MarketList';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMarketData } from '@/services/coingecko';
import { pingBackend } from '@/services/ping';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [backendStatus, setBackendStatus] = useState('');
  // Claim feature state
  const [claimStatus, setClaimStatus] = useState<any>(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimHistory, setClaimHistory] = useState<any[]>([]);
  const [claimHistoryError, setClaimHistoryError] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchMarketData();
        setCoins(
          data.map((coin: any) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            price: coin.current_price,
            iconUrl: coin.image,
            change: coin.price_change_percentage_24h?.toFixed(2) ?? 0,
          }))
        );
      } catch (e) {
        setError('Failed to load market data');
      } finally {
        setLoading(false);
      }
    };
    const checkBackend = async () => {
      const res = await pingBackend();
      if (res.status === 'ok') {
        setBackendStatus(res.message);
      } else {
        setBackendStatus('Backend not reachable');
      }
    };
    const fetchClaimStatus = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/claims/status/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClaimStatus(res.data);
      } catch (e) {
        setClaimStatus(null);
      }
    };
    const fetchClaimHistory = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/claims/list/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Claim history response:', res.data);
        // Handle both direct array and paginated response
        const data = res.data;
        setClaimHistory(Array.isArray(data) ? data : (data.results || []));
      } catch (e: any) {
        console.error('Claim history error:', e.response?.data || e.message);
        setClaimHistoryError('Failed to load claim history');
        setClaimHistory([]);
      }
    };
    const fetchBalance = async () => {
      try {
        if (!token) return;
        const res = await axios.get('http://127.0.0.1:8000/api/wallet/balance/', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setBalance(Number(res.data.balance));
      } catch (e) {
        setBalance(null);
      }
    };
    loadData();
    checkBackend();
    fetchClaimStatus();
    fetchClaimHistory();
    fetchBalance();
  }, [token]);

  const handleShareReferral = async () => {
    if (!user?.referral_code) {
      Alert.alert('No Referral Code', 'Your referral code is not available.');
      return;
    }
    try {
      await Share.share({
        message: `Join Rotech and earn rewards! Use my referral code: ${user.referral_code} when you register to get started. Download the app now!`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share referral code.');
    }
  };

  const handleClaim = async () => {
    setClaimLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/claims/create/', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', res.data.message || 'Claim submitted!');
      // Refresh claim status and history
      const statusRes = await axios.get('http://127.0.0.1:8000/api/claims/status/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaimStatus(statusRes.data);
      const histRes = await axios.get('http://127.0.0.1:8000/api/claims/list/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const histData = histRes.data;
      setClaimHistory(Array.isArray(histData) ? histData : (histData.results || []));
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Claim failed');
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.brand}>Rotech</Text>
      {backendStatus ? (
        <Text style={{ color: backendStatus === 'Everything is working' ? 'green' : 'red', fontWeight: 'bold', marginBottom: 10 }}>{backendStatus}</Text>
      ) : null}
      <BalanceCard balance={balance !== null ? balance : 0} />
      <ActionButtons />

      {/* Claim Feature Section */}
      <View style={{ marginTop: 24, marginBottom: 12 }}>
        <Text style={styles.sectionTitle}>Weekly Claim</Text>
        <ClaimButton
          onPress={handleClaim}
          loading={claimLoading}
          canClaim={claimStatus && (claimStatus.can_claim || claimStatus.is_new_user)}
          disabled={claimLoading || !(claimStatus && (claimStatus.can_claim || claimStatus.is_new_user))}
        />
        <ClaimCountdown
          nextClaimDate={claimStatus && claimStatus.current_claim && claimStatus.current_claim.created_at
            ? new Date(new Date(claimStatus.current_claim.created_at).getTime() + 7 * 24 * 60 * 60 * 1000)
            : undefined}
        />

        {/* Refer Button and Info */}
        <View style={{ alignItems: 'center', marginTop: 18, marginBottom: 12 }}>
          <Text style={{ color: '#7ed957', fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>
            Refer friends and earn <Text style={{color:'#0B0F19'}}>150 RT</Text> instantly!
          </Text>
          <Text style={{ color: '#fff', textAlign: 'center', marginBottom: 8, fontSize: 14 }}>
            When your friend registers with your code, you get paid <Text style={{color:'#7ed957'}}>150 KSH</Text> worth <Text style={{color:'#7ed957'}}>150 RT</Text> instantly to your wallet.
          </Text>
          {user?.referral_code && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#1a2233', borderRadius: 8, padding: 8 }}>
              <Text style={{ color: '#7ed957', fontWeight: 'bold', fontSize: 16, marginRight: 8 }} selectable>
                {user.referral_code}
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: '#7ed957', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12, marginRight: 6 }}
                onPress={() => {
                  if (user?.referral_code) {
                    // Copy to clipboard
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(user.referral_code);
                      Alert.alert('Copied', 'Referral code copied to clipboard!');
                    } else {
                      Alert.alert('Copy not supported', 'Copy to clipboard is not supported on this device.');
                    }
                  }
                }}
              >
                <Text style={{ color: '#0B0F19', fontWeight: 'bold', fontSize: 14 }}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: '#7ed957', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 }}
                onPress={handleShareReferral}
              >
                <Text style={{ color: '#0B0F19', fontWeight: 'bold', fontSize: 14 }}>Share</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <ClaimHistory
          history={Array.isArray(claimHistory) ? claimHistory.map((item: any) => ({
            id: item.id,
            amount: Number(item.amount),
            date: new Date(item.created_at),
            status: item.status === 'approved' ? 'completed' : 'pending',
          })) : []}
        />
      </View>

      <Text style={styles.sectionTitle}>Market</Text>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.dark.accent} style={{ marginTop: 30 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <MarketList coins={coins} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  brand: {
    color: Colors.dark.accent,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 18,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 8,
  },
  error: {
    color: '#FF4B4B',
    fontSize: 16,
    marginTop: 30,
    textAlign: 'center',
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cardPrice: {
    color: '#00D09E',
    fontSize: 22,
    marginTop: 10,
  },
});