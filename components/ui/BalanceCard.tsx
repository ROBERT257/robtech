import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface BalanceCardProps {
  balance: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Portfolio Balance</Text>
      <Text style={styles.balance}>${balance.toLocaleString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 18,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    alignItems: 'center',
  },
  label: {
    color: '#7A869A',
    fontSize: 15,
    marginBottom: 6,
  },
  balance: {
    color: Colors.dark.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
});
