import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Colors } from '@/constants/theme';
import { IconSymbol } from './icon-symbol';

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <IconSymbol name={icon} size={24} color={Colors.dark.accent} />
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

export const ActionButtons: React.FC = () => {
  // Placeholder handlers
  const handlePress = (action: string) => () => {
    // TODO: Implement action logic
    alert(action + ' pressed');
  };

  return (
    <View style={styles.row}>
      <ActionButton icon="arrow.up.right" label="Send" onPress={handlePress('Send')} />
      <ActionButton icon="arrow.down.left" label="Receive" onPress={handlePress('Receive')} />
      <ActionButton icon="cart.fill" label="Buy" onPress={handlePress('Buy')} />
      <ActionButton icon="arrow.swap" label="Swap" onPress={handlePress('Swap')} />
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
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  label: {
    color: Colors.dark.text,
    fontSize: 13,
    marginTop: 6,
    fontWeight: '600',
  },
});
