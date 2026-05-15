import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, Text } from 'react-native';
import { BalanceCard } from '@/components/ui/BalanceCard';
import { ActionButtons } from '@/components/ui/ActionButtons';
import { MarketList } from '@/components/ui/MarketList';
import { fetchMarketData } from '@/services/coingecko';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coins, setCoins] = useState([]);
  const [balance, setBalance] = useState(12450.89); // Placeholder

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
    loadData();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.brand}>Rotech</Text>
      <BalanceCard balance={balance} />
      <ActionButtons />
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