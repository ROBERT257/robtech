import { ActionButtons } from '@/components/ui/ActionButtons';
import { BalanceCard } from '@/components/ui/BalanceCard';
import { ClaimButton } from '@/components/ui/ClaimButton';
import { ClaimCountdown } from '@/components/ui/ClaimCountdown';
import { ClaimHistory } from '@/components/ui/ClaimHistory';
import { MarketList } from '@/components/ui/MarketList';
import { Colors } from '@/constants/theme';
import { API_BASE_URL } from '@/services/api';
import { fetchMarketData } from '@/services/coingecko';
import { pingBackend } from '@/services/ping';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeScreen() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [backendStatus, setBackendStatus] = useState('');
  // Claim feature state
  const [claimStatus, setClaimStatus] = useState<any>(null);
  const [claimStatusLoading, setClaimStatusLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimHistory, setClaimHistory] = useState<any[]>([]);
  const [claimHistoryError, setClaimHistoryError] = useState<string | null>(null);
  const [claimFeedback, setClaimFeedback] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchMarketData();
        setCoins(
          data.map((coin: any) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            price: coin.current_price,
            iconUrl: coin.image,
            change: coin.price_change_percentage_24h?.toFixed(2) ?? 0,
          }))
        );
      } catch (e) {
        setError('Failed to load market data');
      } finally {
        setLoading(false);
      }
    };
    const checkBackend = async () => {
      const res = await pingBackend();
      if (res.status === 'ok') {
        setBackendStatus(res.message);
      } else {
        setBackendStatus('Backend not reachable');
      }
    };
    const fetchClaimStatus = async () => {
      if (!token) {
        setClaimStatus(null);
        setClaimStatusLoading(false);
        return;
      }

      setClaimStatusLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/claims/status/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClaimStatus(res.data);
      } catch (e) {
        setClaimStatus(null);
      } finally {
        setClaimStatusLoading(false);
      }
    };
    const fetchClaimHistory = async () => {
      if (!token) {
        setClaimHistory([]);
        setClaimHistoryError(null);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/claims/history/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Claim history response:', res.data);
        // Handle both direct array and paginated response
        const data = res.data;
        setClaimHistory(Array.isArray(data) ? data : (data.results || []));
      } catch (e: any) {
        console.error('Claim history error:', e.response?.data || e.message);
        setClaimHistoryError('Failed to load claim history');
        setClaimHistory([]);
      }
    };
    const fetchBalance = async () => {
      try {
        if (!token) {
          setBalance(null);
          return;
        }
        const res = await axios.get(`${API_BASE_URL}/wallet/balance/`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setBalance(Number(res.data.balance));
      } catch (e) {
        setBalance(null);
      }
    };
    loadData();
    checkBackend();
    fetchClaimStatus();
    fetchClaimHistory();
    fetchBalance();
  }, [token]);

  const handleShareReferral = async () => {
    if (!user?.referral_code) {
      Alert.alert('No Referral Code', 'Your referral code is not available.');
      return;
    }
    try {
      await Share.share({
        message: `Join Rotech and earn rewards! Use my referral code: ${user.referral_code} when you register to get started. Download the app now!`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share referral code.');
    }
  };

  const handleClaim = async () => {
    if (!token) {
      Alert.alert('Login required', 'Please log in to submit a claim.');
      return;
    }

    setClaimLoading(true);
    setClaimFeedback({ type: 'info', message: 'Submitting your weekly reward request...' });
    try {
      const res = await axios.post(`${API_BASE_URL}/claims/create/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.claim_status) {
        setClaimStatus(res.data.claim_status);
      }
      setClaimFeedback({
        type: 'success',
        message: res.data?.pending_message || res.data?.message || 'Claim submitted successfully. Your reward is awaiting approval.',
      });
      Alert.alert('Success', res.data?.pending_message || res.data?.message || 'Claim submitted successfully');
      // Refresh claim status and history
      const statusRes = await axios.get(`${API_BASE_URL}/claims/status/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaimStatus(statusRes.data);
      const histRes = await axios.get(`${API_BASE_URL}/claims/history/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const histData = histRes.data;
      setClaimHistory(Array.isArray(histData) ? histData : (histData.results || []));
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || e.response?.data?.message || 'Claim failed';
      setClaimFeedback({ type: 'error', message: errorMessage });
      Alert.alert('Error', errorMessage);
    } finally {
      setClaimLoading(false);
    }
  };

  const claimState = !token
    ? 'logged_out'
    : claimStatusLoading
      ? 'available'
      : claimStatus?.claim_state === 'pending' || claimStatus?.pending_review
        ? 'pending'
        : claimStatus?.claim_state === 'approved'
          ? 'approved'
          : claimStatus?.can_claim
            ? 'available'
            : 'locked';

  const claimAmount = Number(claimStatus?.claim_amount || 0);
  const rewardLabel = claimAmount > 0 ? `+${claimAmount} RT` : 'This week\'s reward';

  const claimMessage = claimState === 'pending'
    ? `Your request is under review${claimStatus?.estimated_review_time ? ` • Usually approved within ${claimStatus.estimated_review_time}` : ''}`
    : claimState === 'approved'
      ? 'Reward sent to wallet'
      : claimState === 'locked'
        ? (claimStatus?.message || 'You already claimed this week')
        : claimState === 'logged_out'
          ? 'Sign in to unlock weekly rewards'
          : (claimStatus?.message || 'Tap to submit your weekly reward');

  const claimResetDate = claimStatus?.next_claim_at ? new Date(claimStatus.next_claim_at) : null;

  const trustSignals = [
    '✓ Secure weekly reward system',
    '✓ One claim per week',
    '✓ Rewards added after approval',
  ];

  const howItWorksSteps = [
    '1. Submit your weekly claim',
    '2. Claim is reviewed automatically or by admin',
    '3. Reward is added to your wallet after approval',
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.brand}>Rotech</Text>
      {backendStatus ? (
        <Text style={{ color: backendStatus === 'Everything is working' ? 'green' : 'red', fontWeight: 'bold', marginBottom: 10 }}>{backendStatus}</Text>
      ) : null}
      <BalanceCard balance={balance !== null ? balance : 0} />
      <ActionButtons />

      {/* Claim Feature Section */}
      <View style={styles.claimCard}>
        <View style={styles.claimHeaderRow}>
          <View style={styles.claimHeaderText}>
            <Text style={styles.sectionTitle}>Weekly Claim</Text>
            <Text style={styles.claimIntro}>Transparent, reviewed rewards with clear approval states.</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakLabel}>Weekly Streak</Text>
            <Text style={styles.streakValue}>{claimStatus?.streak_count || 0} week{Number(claimStatus?.streak_count || 0) === 1 ? '' : 's'} 🔥</Text>
          </View>
        </View>

        <View style={styles.rewardPreviewCard}>
          <Text style={styles.rewardPreviewLabel}>This week&apos;s reward</Text>
          <Text style={styles.rewardPreviewValue}>{rewardLabel}</Text>
          <Text style={styles.rewardPreviewNote}>Reward is credited after approval, not instantly on tap.</Text>
        </View>

        {claimFeedback ? (
          <View style={[styles.feedbackBanner, claimFeedback.type === 'success' ? styles.feedbackSuccess : claimFeedback.type === 'error' ? styles.feedbackError : styles.feedbackInfo]}>
            <Text style={styles.feedbackTitle}>{claimFeedback.type === 'success' ? 'Claim submitted successfully' : claimFeedback.type === 'error' ? 'Claim update' : 'Claim status'}</Text>
            <Text style={styles.feedbackText}>{claimFeedback.message}</Text>
          </View>
        ) : null}

        <ClaimButton
          onPress={handleClaim}
          loading={claimLoading || claimStatusLoading}
          state={claimState}
          rewardLabel={rewardLabel}
          helperText={claimMessage}
          disabled={claimLoading || claimStatusLoading}
        />

        <ClaimCountdown
          nextClaimAt={claimStatus?.next_claim_at}
          canClaim={claimState === 'available'}
          pendingReview={claimState === 'pending'}
          claimMessage={claimMessage}
        />

        <View style={styles.statusMessageCard}>
          <Text style={styles.statusMessageLabel}>Status</Text>
          <Text style={styles.statusMessageText}>{claimStatus?.message || claimMessage}</Text>
          <Text style={styles.statusMessageSubtext}>
            {claimState === 'pending'
              ? 'Your reward is in review and will be added after approval.'
              : claimState === 'approved'
                ? `Next claim available ${claimResetDate ? claimResetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }) : 'soon'}`
                : claimState === 'locked'
                  ? 'One successful claim is allowed each week.'
                  : claimState === 'logged_out'
                    ? 'Log in to view your reward status and claim history.'
                    : 'Claim when ready. Your wallet updates after approval.'}
          </Text>
        </View>

        <View style={styles.trustSignalsCard}>
          {trustSignals.map((signal) => (
            <Text key={signal} style={styles.trustSignalText}>{signal}</Text>
          ))}
        </View>

        <View style={styles.howItWorksCard}>
          <Text style={styles.howItWorksTitle}>How it works</Text>
          {howItWorksSteps.map((step) => (
            <Text key={step} style={styles.howItWorksStep}>{step}</Text>
          ))}
        </View>

        {claimStatus?.streak_count >= 4 ? (
          <View style={styles.bonusCard}>
            <Text style={styles.bonusTitle}>Bonus unlocked soon</Text>
            <Text style={styles.bonusText}>Claim 4 weeks in a row to unlock extra rewards and keep your streak alive.</Text>
          </View>
        ) : null}

        <View style={{ marginTop: 18, marginBottom: 12 }}>
          <Text style={styles.subsectionTitle}>Referral Rewards</Text>
          <Text style={{ color: '#fff', textAlign: 'center', marginBottom: 8, fontSize: 14 }}>
            When your friend registers with your code, you get paid <Text style={{color:'#7ed957'}}>150 KSH</Text> worth <Text style={{color:'#7ed957'}}>150 RT</Text> instantly to your wallet.
          </Text>
          {user?.referral_code && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#1a2233', borderRadius: 8, padding: 8 }}>
              <Text style={{ color: '#7ed957', fontWeight: 'bold', fontSize: 16, marginRight: 8 }} selectable>
                {user.referral_code}
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: '#7ed957', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12, marginRight: 6 }}
                onPress={() => {
                  if (user?.referral_code) {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(user.referral_code);
                      Alert.alert('Copied', 'Referral code copied to clipboard!');
                    } else {
                      Alert.alert('Copy not supported', 'Copy to clipboard is not supported on this device.');
                    }
                  }
                }}
              >
                <Text style={{ color: '#0B0F19', fontWeight: 'bold', fontSize: 14 }}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: '#7ed957', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 }}
                onPress={handleShareReferral}
              >
                <Text style={{ color: '#0B0F19', fontWeight: 'bold', fontSize: 14 }}>Share</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {claimHistoryError ? (
          <Text style={{ color: '#FF4B4B', textAlign: 'center', marginTop: 10 }}>{claimHistoryError}</Text>
        ) : (
          <ClaimHistory
            history={(Array.isArray(claimHistory) ? claimHistory : []).map((item: any) => ({
              id: item.id,
              amount: Number(item.amount),
              date: new Date(item.created_at),
              status: item.status,
              weekNumber: item.week_number,
              year: item.year,
              reviewedAt: item.reviewed_at ? new Date(item.reviewed_at) : (item.approved_at ? new Date(item.approved_at) : null),
              rewardLabel: item.reward_label,
            }))}
          />
        )}
      </View>

      <Text style={styles.sectionTitle}>Market</Text>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.dark.accent} style={{ marginTop: 30 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <MarketList coins={coins} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  brand: {
    color: Colors.dark.accent,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 18,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 8,
  },
  subsectionTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  error: {
    color: '#FF4B4B',
    fontSize: 16,
    marginTop: 30,
    textAlign: 'center',
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cardPrice: {
    color: '#00D09E',
    fontSize: 22,
    marginTop: 10,
  },
  claimCard: {
    backgroundColor: '#101827',
    borderColor: 'rgba(126, 217, 87, 0.14)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  claimHeaderRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  claimHeaderText: {
    flex: 1,
  },
  claimIntro: {
    color: '#9AA7B8',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  streakBadge: {
    backgroundColor: 'rgba(126, 217, 87, 0.12)',
    borderColor: 'rgba(126, 217, 87, 0.18)',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'flex-end',
  },
  streakLabel: {
    color: '#9AA7B8',
    fontSize: 11,
    fontWeight: '600',
  },
  streakValue: {
    color: Colors.dark.accent,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  rewardPreviewCard: {
    backgroundColor: '#16202E',
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  rewardPreviewLabel: {
    color: '#9AA7B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  rewardPreviewValue: {
    color: Colors.dark.accent,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  rewardPreviewNote: {
    color: '#C6D0DC',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  feedbackBanner: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  feedbackSuccess: {
    backgroundColor: 'rgba(47, 214, 123, 0.14)',
    borderColor: 'rgba(47, 214, 123, 0.25)',
    borderWidth: 1,
  },
  feedbackError: {
    backgroundColor: 'rgba(255, 75, 75, 0.12)',
    borderColor: 'rgba(255, 75, 75, 0.22)',
    borderWidth: 1,
  },
  feedbackInfo: {
    backgroundColor: 'rgba(126, 217, 87, 0.12)',
    borderColor: 'rgba(126, 217, 87, 0.2)',
    borderWidth: 1,
  },
  feedbackTitle: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  feedbackText: {
    color: '#D4DDE8',
    fontSize: 13,
    lineHeight: 18,
  },
  statusMessageCard: {
    backgroundColor: '#16202E',
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
  },
  statusMessageLabel: {
    color: '#9AA7B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusMessageText: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  statusMessageSubtext: {
    color: '#C6D0DC',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  trustSignalsCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  trustSignalText: {
    color: '#D6E3D0',
    fontSize: 12,
    backgroundColor: 'rgba(126, 217, 87, 0.1)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  howItWorksCard: {
    backgroundColor: '#16202E',
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
  },
  howItWorksTitle: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  howItWorksStep: {
    color: '#C6D0DC',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  bonusCard: {
    backgroundColor: 'rgba(244, 185, 66, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 185, 66, 0.24)',
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
  },
  bonusTitle: {
    color: '#FFD56A',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  bonusText: {
    color: '#F5E8C3',
    fontSize: 13,
    lineHeight: 18,
  },
});