import { ActionButtons } from '@/components/ui/ActionButtons';
import { BalanceCard } from '@/components/ui/BalanceCard';
import { ClaimButton } from '@/components/ui/ClaimButton';
import { ClaimCountdown } from '@/components/ui/ClaimCountdown';
import { ClaimHistory } from '@/components/ui/ClaimHistory';
import { MarketList } from '@/components/ui/MarketList';
import { Colors } from '@/constants/theme';
import { fetchMarketData } from '@/services/coingecko';
import { pingBackend } from '@/services/ping';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coins, setCoins] = useState([]);
  const [balance, setBalance] = useState(12450.89); // Placeholder
  const [backendStatus, setBackendStatus] = useState('');
  // Claim feature state
  const [claimStatus, setClaimStatus] = useState<any>(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimHistory, setClaimHistory] = useState<any[]>([]);

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
        const res = await axios.get('http://127.0.0.1:8000/api/claims/status/', { withCredentials: true });
        setClaimStatus(res.data);
      } catch (e) {
        setClaimStatus(null);
      }
    };
    const fetchClaimHistory = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/claims/list/', { withCredentials: true });
        setClaimHistory(res.data);
      } catch (e) {
        setClaimHistory([]);
      }
    };
    loadData();
    checkBackend();
    fetchClaimStatus();
    fetchClaimHistory();
  }, []);

  const handleClaim = async () => {
    setClaimLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/claims/create/', {}, { withCredentials: true });
      Alert.alert('Success', res.data.message || 'Claim submitted!');
      // Refresh claim status and history
      const statusRes = await axios.get('http://127.0.0.1:8000/api/claims/status/', { withCredentials: true });
      setClaimStatus(statusRes.data);
      const histRes = await axios.get('http://127.0.0.1:8000/api/claims/list/', { withCredentials: true });
      setClaimHistory(histRes.data);
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
      <BalanceCard balance={balance} />
      <ActionButtons />

      {/* Claim Feature Section */}
      <View style={{ marginTop: 24, marginBottom: 12 }}>
        <Text style={styles.sectionTitle}>Weekly Claim</Text>
        <ClaimButton
          onPress={handleClaim}
          loading={claimLoading}
          canClaim={!!(claimStatus && claimStatus.can_claim)}
          disabled={claimLoading || !(claimStatus && claimStatus.can_claim)}
        />
        <ClaimCountdown
          nextClaimDate={claimStatus && claimStatus.current_claim && claimStatus.current_claim.created_at
            ? new Date(new Date(claimStatus.current_claim.created_at).getTime() + 7 * 24 * 60 * 60 * 1000)
            : undefined}
        />
        <ClaimHistory
          history={claimHistory.map((item: any) => ({
            id: item.id,
            amount: Number(item.amount),
            date: new Date(item.created_at),
            status: item.status === 'approved' ? 'completed' : 'pending',
          }))}
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
    flex: 1,
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