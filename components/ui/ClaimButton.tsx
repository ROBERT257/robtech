import { Colors } from '@/constants/theme';
import React from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ClaimButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  state?: 'available' | 'pending' | 'approved' | 'locked' | 'logged_out';
  rewardLabel?: string;
  helperText?: string;
}

export const ClaimButton: React.FC<ClaimButtonProps> = ({ 
  onPress, 
  disabled = false, 
  loading = false,
  state = 'available',
  rewardLabel,
  helperText,
}) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: loading ? 0.98 : state === 'available' ? 1.01 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start();
  }, [loading, scale, state]);

  const titleMap = {
    available: 'Claim Weekly Reward',
    pending: 'Claim Pending Review',
    approved: 'Reward Claimed ✓',
    locked: 'Already Claimed This Week',
    logged_out: 'Login to Claim',
  } as const;

  const subtitleMap = {
    available: 'Secure weekly reward',
    pending: 'Review in progress',
    approved: 'Wallet updated after approval',
    locked: 'Come back next week',
    logged_out: 'Sign in to unlock your reward',
  } as const;

  const isDisabled = disabled || loading || state !== 'available';

  const backgroundColor = state === 'available'
    ? Colors.dark.accent
    : state === 'pending'
      ? '#F4B942'
      : state === 'approved'
        ? '#2FD67B'
        : '#2A3244';

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor },
          isDisabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
      >
        <View style={styles.buttonContent}>
          <View style={styles.textGroup}>
            <Text style={styles.buttonText}>{titleMap[state]}</Text>
            <Text style={styles.buttonSubtext}>{helperText || subtitleMap[state]}</Text>
          </View>

          <View style={styles.rightGroup}>
            {rewardLabel ? (
              <View style={styles.rewardPill}>
                <Text style={styles.rewardPillText}>{rewardLabel}</Text>
              </View>
            ) : null}
            {loading ? (
              <ActivityIndicator color={Colors.dark.background} size="small" />
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
    elevation: 8,
  },
  buttonDisabled: {
    boxShadow: 'none',
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textGroup: {
    flex: 1,
  },
  buttonText: {
    color: Colors.dark.background,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  buttonSubtext: {
    color: 'rgba(11, 15, 25, 0.72)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  rightGroup: {
    alignItems: 'flex-end',
    gap: 8,
  },
  rewardPill: {
    backgroundColor: 'rgba(11, 15, 25, 0.16)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rewardPillText: {
    color: Colors.dark.background,
    fontSize: 12,
    fontWeight: '700',
  },
});
