import { Colors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.12)',
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
