import { Colors } from '@/constants/theme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ClaimCountdownProps {
  nextClaimAt?: string | Date | null;
  canClaim?: boolean;
  pendingReview?: boolean;
  claimMessage?: string;
}

export const ClaimCountdown: React.FC<ClaimCountdownProps> = ({ nextClaimAt, canClaim = false, pendingReview = false, claimMessage }) => {
  const [displayText, setDisplayText] = useState('Claim available now');
  const [detailText, setDetailText] = useState('');

  useEffect(() => {
    const getTargetDate = () => {
      if (!nextClaimAt) {
        return null;
      }

      return nextClaimAt instanceof Date ? nextClaimAt : new Date(nextClaimAt);
    };

    const formatMessage = () => {
      if (pendingReview) {
        setDisplayText('Review in progress');
        setDetailText('Your reward is being checked and will land in your wallet after approval.');
        return;
      }

      if (canClaim) {
        setDisplayText('Claim available now');
        setDetailText(claimMessage || 'Submit your weekly reward request when you are ready.');
        return;
      }

      const targetDate = getTargetDate();

      if (!targetDate || Number.isNaN(targetDate.getTime())) {
        setDisplayText('Next claim soon');
        setDetailText(claimMessage || 'Your next claim window will open soon.');
        return;
      }

      const difference = targetDate.getTime() - Date.now();
      if (difference <= 0) {
        setDisplayText('Claim available now');
        setDetailText(claimMessage || 'You can submit your weekly reward now.');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const readableDate = targetDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      if (days > 0) {
        setDisplayText(`Next claim available in ${days} day${days === 1 ? '' : 's'}`);
      } else if (hours > 0) {
        setDisplayText(`Next claim available in ${hours} hour${hours === 1 ? '' : 's'}`);
      } else {
        setDisplayText(`Next claim available in ${minutes} minute${minutes === 1 ? '' : 's'}`);
      }

      setDetailText(`Claim resets on ${readableDate}`);
    };

    formatMessage();

    const timer = setInterval(formatMessage, 60 * 1000);

    return () => clearInterval(timer);
  }, [canClaim, claimMessage, nextClaimAt, pendingReview]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{displayText}</Text>
      <View style={styles.detailPill}>
        <Text style={styles.detailText}>{detailText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  label: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  detailPill: {
    backgroundColor: 'rgba(126, 217, 87, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(126, 217, 87, 0.22)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    maxWidth: '100%',
  },
  detailText: {
    color: Colors.dark.accent,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
