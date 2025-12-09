import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  buttonText?: string;
  showSecondaryButton?: boolean;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
}

export default function SuccessModal({
  visible,
  title,
  message,
  onClose,
  buttonText = 'OK',
  showSecondaryButton = false,
  secondaryButtonText = 'Buat Lagi',
  onSecondaryPress,
}: SuccessModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>✓</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons Container */}
          <View style={showSecondaryButton ? styles.buttonContainer : {}}>
            {showSecondaryButton && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onSecondaryPress}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  {secondaryButtonText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, showSecondaryButton && styles.primaryButtonInContainer]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#0A4D9F',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: '#E0E0E0',
    flex: 1,
  },
  primaryButtonInContainer: {
    flex: 1,
  },
  secondaryButtonText: {
    color: '#333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
