import { Colors } from '@/constants/theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ClaimButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  canClaim?: boolean;
}

export const ClaimButton: React.FC<ClaimButtonProps> = ({ 
  onPress, 
  disabled = false, 
  loading = false,
  canClaim = true 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        !canClaim && styles.buttonDisabled
      ]}
      onPress={onPress}
      disabled={disabled || loading || !canClaim}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={Colors.dark.background} size="small" />
      ) : (
        <Text style={styles.buttonText}>
          {canClaim ? 'Claim Weekly Tokens' : 'Claim Unavailable'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.dark.accent,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#2A3244',
    boxShadow: 'none',
    elevation: 0,
  },
  buttonText: {
    color: Colors.dark.background,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
