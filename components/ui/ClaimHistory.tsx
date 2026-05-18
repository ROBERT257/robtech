import { Colors } from '@/constants/theme';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from './icon-symbol';

interface ClaimHistoryItem {
  id: string;
  amount: number;
  date: Date;
  status: 'completed' | 'pending';
}

interface ClaimHistoryProps {
  history?: ClaimHistoryItem[];
}

export const ClaimHistory: React.FC<ClaimHistoryProps> = ({ history = [] }) => {
  const displayHistory = history;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Claim History</Text>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {displayHistory.length > 0 ? (
          displayHistory.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.iconContainer}>
                <IconSymbol name="check-circle" size={20} color={Colors.dark.accent} />
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemAmount}>+{item.amount} RT</Text>
                <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
              </View>
              <View style={[styles.statusBadge, item.status === 'completed' && styles.statusCompleted]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No claim history yet</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  scrollContainer: {
    maxHeight: 200,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemAmount: {
    color: Colors.dark.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  itemDate: {
    color: '#7A869A',
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#2A3244',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusCompleted: {
    backgroundColor: 'rgba(0, 208, 158, 0.15)',
  },
  statusText: {
    color: Colors.dark.accent,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyText: {
    color: '#7A869A',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
