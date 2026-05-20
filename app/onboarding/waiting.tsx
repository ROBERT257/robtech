import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { pollPaymentStatus, retryPayment } from '../../services/wallet';

export default function WaitingStep() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const paymentId = params?.paymentId as string;
  const [status, setStatus] = useState('pending');
  const [info, setInfo] = useState<any>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!paymentId) return;
    (async () => {
      const res: any = await pollPaymentStatus(paymentId, (s, d) => { if (mounted) { setStatus(s); setInfo(d); } });
      if (!mounted) return;
      if (res.status === 'completed' || (res && res.status === 'completed')) {
        router.replace('/onboarding/success');
      } else {
        // stay on waiting page so user can retry manually
      }
    })();

    return () => { mounted = false; };
  }, [paymentId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Waiting for M‑Pesa confirmation</Text>
      <Text style={styles.subtitle}>Check your phone and enter your M‑Pesa PIN when prompted</Text>
      <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 20 }} />
      <Text style={styles.status}>Status: {status}</Text>
      <TouchableOpacity style={styles.cta} onPress={async () => {
        try {
          setRetrying(true);
          const result = await retryPayment(paymentId);
          setStatus('processing');
          Alert.alert('Retry started', result.message || 'Check your phone for the M-Pesa prompt.');
        } catch (err: any) {
          Alert.alert('Retry failed', err.message || String(err));
        } finally {
          setRetrying(false);
        }
      }} disabled={retrying}>
        <Text style={styles.ctaText}>{retrying ? 'Retrying...' : 'Retry payment'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#0B0F19' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#ccc', fontSize: 13, marginBottom: 12 },
  status: { color: '#aaa', marginTop: 12 },
  cta: { marginTop: 20, backgroundColor: '#333', padding: 12, borderRadius: 10, alignItems: 'center' },
  ctaText: { color: '#fff' },
});
