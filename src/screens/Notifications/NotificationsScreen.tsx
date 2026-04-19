import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar, Platform, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../context/NotificationContext';
import { COLORS } from '../../constants/colors';
import { Notification } from '../../types';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: Notification['type']): any => {
    switch (type) {
      case 'booking': return 'calendar';
      case 'account': return 'shield-checkmark';
      case 'promo': return 'gift';
      default: return 'notifications';
    }
  };

  const getIconBg = (type: Notification['type']) => {
    switch (type) {
      case 'booking': return 'rgba(212, 165, 116, 0.1)';
      case 'account': return 'rgba(10, 30, 61, 0.05)';
      case 'promo': return 'rgba(22, 163, 74, 0.1)';
      default: return 'rgba(156, 163, 175, 0.1)';
    }
  };

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'booking': return COLORS.gold;
      case 'account': return COLORS.navy;
      case 'promo': return '#16a34a';
      default: return COLORS.gray400;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f6f3' }}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={headerStyles.header}>
        <View style={headerStyles.headerDecor1} />
        <View style={headerStyles.headerDecor2} />
        <View style={headerStyles.headerContent}>
          <TouchableOpacity style={headerStyles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={headerStyles.headerTitle}>Notifications</Text>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={headerStyles.readAllText}>Mark all read</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={bodyStyles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 20, paddingTop: 30 }}>
          {notifications.length === 0 ? (
            <View style={bodyStyles.emptyBox}>
              <Ionicons name="notifications-off-outline" size={64} color={COLORS.gray200} />
              <Text style={bodyStyles.emptyText}>No notifications yet</Text>
            </View>
          ) : (
            notifications.map(n => (
              <TouchableOpacity 
                key={n.id} 
                style={[cardStyles.card, !n.isRead && cardStyles.unreadCard]}
                onPress={() => markAsRead(n.id)}
                activeOpacity={0.7}
              >
                <View style={[cardStyles.iconBox, { backgroundColor: getIconBg(n.type) }]}>
                  <Ionicons name={getIcon(n.type)} size={20} color={getIconColor(n.type)} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={cardStyles.titleRow}>
                    <Text style={[cardStyles.title, !n.isRead && cardStyles.unreadTitle]}>{n.title}</Text>
                    {!n.isRead && <View style={cardStyles.dot} />}
                  </View>
                  <Text style={cardStyles.message}>{n.message}</Text>
                  <Text style={cardStyles.time}>
                    {new Date(n.createdAt).toLocaleDateString()} · {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.navy,
    height: 160,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerDecor1: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: COLORS.gold, opacity: 0.1, top: -40, right: -30,
  },
  headerDecor2: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.gold, opacity: 0.05, bottom: 20, left: -20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  readAllText: { fontSize: 13, color: COLORS.gold, fontWeight: '600' },
});

const bodyStyles = StyleSheet.create({
  scroll: { flex: 1, marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#f8f6f3' },
  emptyBox: { padding: 60, alignItems: 'center' },
  emptyText: { marginTop: 16, color: COLORS.gray400, fontSize: 16 },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#f0ede8',
    gap: 14,
  },
  unreadCard: {
    borderColor: COLORS.gold + '30',
    backgroundColor: '#fffcf9',
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 15, color: COLORS.navy, fontWeight: '600' },
  unreadTitle: { fontWeight: '800' },
  message: { fontSize: 13, color: COLORS.gray600, lineHeight: 18, marginTop: 2 },
  time: { fontSize: 11, color: COLORS.gray400, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gold },
});
