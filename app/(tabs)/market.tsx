import { MarketList } from '@/components/ui/MarketList';
import { Colors } from '@/constants/theme';
import { fetchMarketData } from '@/services/coingecko';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function MarketScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coins, setCoins] = useState([]);
  const [marketCap, setMarketCap] = useState('2.4T');
  const [volume, setVolume] = useState('89.2B');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchMarketData(['bitcoin', 'ethereum', 'solana', 'binancecoin', 'cardano', 'ripple', 'polkadot', 'dogecoin', 'avalanche-2', 'chainlink']);
        setCoins(
          data.map((coin: any) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            price: coin.current_price,
            iconUrl: coin.image,
            change: coin.price_change_percentage_24h?.toFixed(2) ?? 0,
            marketCap: coin.market_cap,
            volume: coin.total_volume,
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
      <Animated.Text entering={FadeIn} style={styles.brand}>Market</Animated.Text>
      <Animated.Text entering={FadeIn.delay(100)} style={styles.subtitle}>Live cryptocurrency prices</Animated.Text>
      
      <Animated.View entering={FadeIn.delay(200)} style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Market Cap</Text>
          <Text style={styles.statValue}>${marketCap}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>24h Volume</Text>
          <Text style={styles.statValue}>${volume}</Text>
        </View>
      </Animated.View>

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
    marginBottom: 8,
  },
  subtitle: {
    color: '#7A869A',
    fontSize: 16,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
  },
  statLabel: {
    color: '#7A869A',
    fontSize: 13,
    marginBottom: 6,
  },
  statValue: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: '#FF4B4B',
    fontSize: 16,
    marginTop: 30,
    textAlign: 'center',
  },
});
