import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CoinCard } from './CoinCard';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  iconUrl: string;
  change: number;
}

interface MarketListProps {
  coins: Coin[];
  onCoinPress?: (coin: Coin) => void;
}

export const MarketList: React.FC<MarketListProps> = ({ coins, onCoinPress }) => {
  return (
    <View style={styles.container}>
      {coins.map((item) => (
        <CoinCard
          key={item.id}
          {...item}
          onPress={onCoinPress ? () => onCoinPress(item) : undefined}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
});
