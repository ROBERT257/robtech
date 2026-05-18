
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

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
        const balRes = await axios.get('http://127.0.0.1:8000/api/wallet/balance/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBalance(balRes.data.balance);
        const txRes = await axios.get('http://127.0.0.1:8000/api/wallet/transactions/', {
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
    <View style={styles.container}>
      <Text style={styles.title}>Wallet</Text>
      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <Text style={styles.balance}>Balance: {balance} RT</Text>
          <Text style={styles.section}>Transactions</Text>
          <FlatList
            data={transactions}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.txCard}>
                <Text style={styles.txType}>{item.transaction_type}</Text>
                <Text style={styles.txAmount}>{item.amount} RT</Text>
                <Text style={styles.txDesc}>{item.description}</Text>
                <Text style={styles.txDate}>{new Date(item.created_at).toLocaleString()}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No transactions yet.</Text>}
          />
        </>
      )}
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
  balance: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
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
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    width: '100%',
  },
  txType: { color: '#7ed957', fontWeight: 'bold' },
  txAmount: { color: '#fff', fontSize: 16 },
  txDesc: { color: '#ccc', fontSize: 12 },
  txDate: { color: '#888', fontSize: 10, marginTop: 2 },
  error: { color: 'red', marginTop: 16 },
  empty: { color: '#ccc', marginTop: 16, textAlign: 'center' },
});