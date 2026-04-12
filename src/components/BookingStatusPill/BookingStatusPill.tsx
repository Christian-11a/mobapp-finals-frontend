import React from 'react';
import { Text, View } from 'react-native';
import styles from './styles';

type Status = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

const COLOR_MAP: Record<Status, { bg: string; text: string }> = {
  Pending: { bg: '#fefce8', text: '#d97706' },
  Confirmed: { bg: '#f0fdf4', text: '#16a34a' },
  Completed: { bg: '#eff6ff', text: '#2563eb' },
  Cancelled: { bg: '#fef2f2', text: '#dc2626' },
};

export default function BookingStatusPill({ status }: { status: Status }) {
  const c = COLOR_MAP[status] ?? COLOR_MAP.Pending;
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{status}</Text>
    </View>
  );
}
