

import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_BASE_URL } from '@/services/api';

export default function WalletScreen() {

  const { token } = useAuth();
  const [balance, setBalance] = useState<string>('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWallet = async () => {
      setLoading(true);
      setError('');
      try {
        const balRes = await axios.get(`${API_BASE_URL}/wallet/balance/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBalance(balRes.data.balance);
        const txRes = await axios.get(`${API_BASE_URL}/wallet/transactions/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(txRes.data.results || []);
      } catch (e: any) {
        setError('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchWallet();
  }, [token]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Ionicons name="wallet" size={48} color="#7ed957" style={{ marginRight: 12 }} />
        <View>
          <Text style={styles.title}>Wallet</Text>
          <Text style={styles.balance}>{balance} RT</Text>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <Text style={styles.section}>Transactions</Text>
          {transactions.length > 0 ? (
            transactions.map((item) => (
              <View key={item.id} style={styles.txCard}>
                <View style={styles.txRow}>
                  <Ionicons name="swap-horizontal" size={20} color="#7ed957" style={{ marginRight: 8 }} />
                  <Text style={styles.txType}>{item.transaction_type}</Text>
                  <Text style={styles.txAmount}>{item.amount} RT</Text>
                </View>
                <Text style={styles.txDesc}>{item.description}</Text>
                <Text style={styles.txDate}>{new Date(item.created_at).toLocaleString()}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>No transactions yet.</Text>
          )}
        </>
      )}
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
  balance: {
    color: '#7ed957',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
  },
  section: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  txCard: {
    backgroundColor: '#1a2233',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    width: '100%',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 1,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  txType: { color: '#7ed957', fontWeight: 'bold', marginRight: 8 },
  txAmount: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  txDesc: { color: '#ccc', fontSize: 12, marginTop: 2 },
  txDate: { color: '#888', fontSize: 10, marginTop: 2 },
  error: { color: 'red', marginTop: 16 },
  empty: { color: '#ccc', marginTop: 16, textAlign: 'center' },
});