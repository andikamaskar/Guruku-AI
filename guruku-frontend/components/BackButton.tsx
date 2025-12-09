import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';

interface BackButtonProps {
  onPress: () => void;
}

export default function BackButton({ onPress }: BackButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>← Kembali</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 15,
  },
  text: {
    color: '#0A4D9F',
    fontSize: 16,
    fontWeight: '600',
  },
});
