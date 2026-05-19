import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { receiveTokens } from '@/services/wallet';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from './icon-symbol';

interface ActionButtonProps {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, subtitle, onPress }) => (
  <TouchableOpacity
    style={styles.button}
    onPress={() => {
      try {
        console.log('Action pressed:', label);
      } catch {}
      // ensure at least some feedback
      try {
        onPress();
      } catch (e) {
        Alert.alert('Action', label);
      }
    }}
    accessible
    accessibilityRole="button"
  >
    <IconSymbol name={icon} size={24} color={Colors.dark.accent} />
    <Text style={styles.label}>{label}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </TouchableOpacity>
);

export const ActionButtons: React.FC = () => {
  const handleComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature will be available soon!');
  };

  const { token } = useAuth();

  const handleReceive = async () => {
    try {
      const res = await receiveTokens();
      Alert.alert('Receive', res.data?.address ? `Deposit address: ${res.data.address}` : 'Ready to receive tokens.');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to get receive info');
    }
  };

  return (
    <View style={styles.row}>
      <ActionButton icon="arrow.up.right" label="Send" subtitle="Transfer RT to others" onPress={handleComingSoon} />
      <ActionButton icon="arrow.down.left" label="Receive" subtitle="Get deposit address" onPress={handleReceive} />
      <ActionButton icon="cart.fill" label="Buy" subtitle="Buy RT with M-Pesa" onPress={handleComingSoon} />
      <ActionButton icon="arrow.swap" label="Swap" subtitle="Swap tokens" onPress={handleComingSoon} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 18,
  },
  button: {
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
  },
  label: {
    color: Colors.dark.text,
    fontSize: 13,
    marginTop: 6,
    fontWeight: '600',
  },
  subtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});
