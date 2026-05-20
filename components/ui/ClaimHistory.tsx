import { Colors } from '@/constants/theme';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from './icon-symbol';

interface ClaimHistoryItem {
  id: string;
  amount: number;
  date: Date;
  status: 'approved' | 'pending' | 'rejected';
  weekNumber?: number;
  year?: number;
  reviewedAt?: Date | null;
  rewardLabel?: string;
}

interface ClaimHistoryProps {
  history?: ClaimHistoryItem[];
}

export const ClaimHistory: React.FC<ClaimHistoryProps> = ({ history = [] }) => {
  const displayHistory = history;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusLabel = (status: ClaimHistoryItem['status']) => {
    if (status === 'approved') return 'Approved';
    if (status === 'rejected') return 'Rejected';
    return 'Pending Review';
  };

  const getStatusStyle = (status: ClaimHistoryItem['status']) => {
    if (status === 'approved') return styles.statusApproved;
    if (status === 'rejected') return styles.statusRejected;
    return styles.statusPending;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Claim History</Text>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {displayHistory.length > 0 ? (
          displayHistory.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.iconContainer}>
                <IconSymbol
                  name={item.status === 'approved' ? 'checkmark.circle.fill' : item.status === 'rejected' ? 'xmark.circle.fill' : 'clock.fill'}
                  size={20}
                  color={item.status === 'approved' ? Colors.dark.accent : item.status === 'rejected' ? '#FF7B7B' : '#F4B942'}
                />
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemAmount}>{item.rewardLabel || `+${item.amount} RT`}</Text>
                <Text style={styles.itemDate}>
                  {item.weekNumber && item.year ? `Week ${item.weekNumber} • ${item.year}` : formatDate(item.date)}
                </Text>
                <Text style={styles.reviewedText}>
                  {item.reviewedAt ? `Reviewed ${formatDate(item.reviewedAt)}` : `Submitted ${formatDate(item.date)}`}
                </Text>
              </View>
              <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                <Text style={[
                  styles.statusText,
                  item.status === 'approved' && styles.statusTextApproved,
                  item.status === 'pending' && styles.statusTextPending,
                  item.status === 'rejected' && styles.statusTextRejected,
                ]}>{getStatusLabel(item.status)}</Text>
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
  statusApproved: {
    backgroundColor: 'rgba(0, 208, 158, 0.15)',
  },
  statusPending: {
    backgroundColor: 'rgba(244, 185, 66, 0.15)',
  },
  statusRejected: {
    backgroundColor: 'rgba(255, 123, 123, 0.15)',
  },
  statusText: {
    color: Colors.dark.accent,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusTextApproved: {
    color: Colors.dark.accent,
  },
  statusTextPending: {
    color: '#F4B942',
  },
  statusTextRejected: {
    color: '#FF7B7B',
  },
  reviewedText: {
    color: '#7A869A',
    fontSize: 11,
    marginTop: 4,
  },
  emptyText: {
    color: '#7A869A',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
