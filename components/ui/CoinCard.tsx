import { Colors } from '@/constants/theme';
import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface CoinCardProps {
  name: string;
  symbol: string;
  price: number;
  iconUrl: string;
  change: number;
  onPress?: () => void;
}

export const CoinCard: React.FC<CoinCardProps> = ({ name, symbol, price, iconUrl, change, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: iconUrl }} style={styles.icon} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.symbol}>{symbol}</Text>
      </View>
      <View style={styles.priceSection}>
        <Text style={styles.price}>${price.toLocaleString()}</Text>
        <Text style={[styles.change, { color: change >= 0 ? Colors.dark.accent : '#FF4B4B' }]}>{change >= 0 ? '+' : ''}{change}%</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  name: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  symbol: {
    color: '#7A869A',
    fontSize: 13,
    marginTop: 2,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
  change: {
    fontSize: 13,
    marginTop: 2,
  },
});
