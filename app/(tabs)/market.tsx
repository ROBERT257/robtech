import { MarketList } from '@/components/ui/MarketList';
import { Colors } from '@/constants/theme';
import { fetchMarketData } from '@/services/coingecko';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function MarketScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coins, setCoins] = useState([]);
  const [marketCap, setMarketCap] = useState('2.4T');
  const [volume, setVolume] = useState('89.2B');
  const [selectedCoin, setSelectedCoin] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

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
    <>
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
          <MarketList coins={coins} onCoinPress={coin => { setSelectedCoin(coin); setShowModal(true); }} />
        )}
      </ScrollView>

      {/* Modal for live chart (placeholder for now) */}
      <Modal visible={showModal} animationType="slide" transparent={true} onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#1a2233', borderRadius: 18, padding: 24, width: '90%', maxWidth: 400 }}>
            <TouchableOpacity style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }} onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            {selectedCoin && (
              <>
                <Text style={{ color: '#7ed957', fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>{selectedCoin.name} ({selectedCoin.symbol})</Text>
                <Text style={{ color: '#fff', fontSize: 18, marginBottom: 12 }}>${selectedCoin.price}</Text>
                {/* Chart placeholder */}
                <View style={{ height: 220, backgroundColor: '#222b3a', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ color: '#7ed957' }}>Live Chart Coming Soon</Text>
                </View>
                <Text style={{ color: '#fff', fontSize: 14 }}>24h Change: <Text style={{ color: selectedCoin.change >= 0 ? '#7ed957' : '#FF4B4B' }}>{selectedCoin.change}%</Text></Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
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
