import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface ClaimCountdownProps {
  nextClaimDate?: Date;
}

export const ClaimCountdown: React.FC<ClaimCountdownProps> = ({ nextClaimDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Default to 7 days from now if no date provided
    const targetDate = nextClaimDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [nextClaimDate]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <View style={styles.timeUnit}>
      <Text style={styles.timeValue}>{value.toString().padStart(2, '0')}</Text>
      <Text style={styles.timeLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Next claim in</Text>
      <View style={styles.timeContainer}>
        <TimeUnit value={timeLeft.days} label="Days" />
        <Text style={styles.separator}>:</Text>
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <Text style={styles.separator}>:</Text>
        <TimeUnit value={timeLeft.minutes} label="Min" />
        <Text style={styles.separator}>:</Text>
        <TimeUnit value={timeLeft.seconds} label="Sec" />
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
    color: '#7A869A',
    fontSize: 14,
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeUnit: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  timeValue: {
    color: Colors.dark.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  timeLabel: {
    color: '#7A869A',
    fontSize: 12,
    marginTop: 4,
  },
  separator: {
    color: Colors.dark.accent,
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
});
