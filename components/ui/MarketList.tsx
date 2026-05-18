import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
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
      <FlatList
        data={coins}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <CoinCard {...item} onPress={onCoinPress ? () => onCoinPress(item) : undefined} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
});
