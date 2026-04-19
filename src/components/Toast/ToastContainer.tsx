import React, { useEffect, useRef } from 'react';
import { Text, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../context/ToastContext';
import styles from './styles';

const ICONS = { success: 'checkmark-circle', error: 'close-circle', info: 'information-circle' };

export default function ToastContainer() {
  const { toast } = useToast();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      // Entry Animation
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      // Exit Animation
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [toast, anim]);

  if (!toast) return null;

  const isCenter = toast.position === 'center';

  const translateAnim = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      toast.position === 'top' ? -100 : (toast.position === 'bottom' ? 100 : 0), 
      0
    ],
  });

  const opacityAnim = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const scaleAnim = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [isCenter ? 0.8 : 1, 1],
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        styles[toast.type],
        styles[toast.position],
        { 
          opacity: opacityAnim,
          transform: [
            { translateY: translateAnim },
            { scale: scaleAnim }
          ]
        }
      ]} 
      pointerEvents="none"
    >
      <Ionicons 
        name={ICONS[toast.type] as any} 
        size={isCenter ? 48 : 22} 
        color="white" 
        style={[styles.icon, isCenter && styles.centerIcon]} 
      />
      <Text style={[styles.text, isCenter && styles.centerText]}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}
