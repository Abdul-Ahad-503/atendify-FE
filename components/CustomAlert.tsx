import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface AlertType {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  showConfirm?: boolean;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

interface CustomAlertProps {
  visible: boolean;
  alert: AlertType;
  onClose?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  alert,
  onClose,
}) => {
  // Auto close after 3 seconds if no buttons
  useEffect(() => {
    if (visible && !alert.onConfirm && !alert.onCancel && !alert.loading) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, alert, onClose]);

  const getAlertStyle = () => {
    switch (alert.type) {
      case 'success':
        return {
          icon: 'check-circle',
          iconColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: '#10B981',
          titleColor: '#10B981',
        };
      case 'error':
        return {
          icon: 'error',
          iconColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: '#EF4444',
          titleColor: '#EF4444',
        };
      case 'warning':
        return {
          icon: 'warning',
          iconColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: '#F59E0B',
          titleColor: '#F59E0B',
        };
      case 'info':
      default:
        return {
          icon: 'info',
          iconColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: '#3B82F6',
          titleColor: '#3B82F6',
        };
    }
  };

  const styles = getAlertStyle();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={[styles.alertBox, { borderColor: styles.borderColor }]}>
                {/* Icon */}
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: styles.backgroundColor },
                  ]}
                >
                  <MaterialIcons
                    name={styles.icon}
                    size={32}
                    color={styles.iconColor}
                  />
                </View>

                {/* Content */}
                <View style={styles.content}>
                  <Text style={[styles.title, { color: styles.titleColor }]}>
                    {alert.title}
                  </Text>
                  {alert.message && (
                    <Text style={styles.message}>{alert.message}</Text>
                  )}
                  {alert.loading && (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator
                        size="small"
                        color={styles.iconColor}
                      />
                      <Text style={[styles.loadingText, { color: styles.iconColor }]}>
                        Processing...
                      </Text>
                    </View>
                  )}
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  {alert.showCancel && (
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => {
                        alert.onCancel?.();
                        onClose?.();
                      }}
                    >
                      <Text style={styles.cancelButtonText}>
                        {alert.cancelText || 'Cancel'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {alert.showConfirm && (
                    <TouchableOpacity
                      style={[
                        styles.button,
                        styles.confirmButton,
                        { borderColor: styles.borderColor },
                      ]}
                      onPress={() => {
                        alert.onConfirm?.();
                        onClose?.();
                      }}
                      disabled={alert.loading}
                    >
                      {alert.loading ? (
                        <ActivityIndicator size="small" color={Colors.surface} />
                      ) : (
                        <Text style={styles.confirmButtonText}>
                          {alert.confirmText || 'OK'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

interface UseAlertReturn {
  showAlert: (alert: AlertType) => void;
  hideAlert: () => void;
}

export const useAlert = (): UseAlertReturn => {
  const [alert, setAlert] = React.useState<AlertType | null>(null);

  const showAlert = (alertData: AlertType) => {
    setAlert(alertData);
  };

  const hideAlert = () => {
    setAlert(null);
  };

  return { showAlert, hideAlert };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: SCREEN_WIDTH * 0.9,
  },
  alertBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  content: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    ...Typography.h3,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  loadingText: {
    ...Typography.small,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: Colors.secondary,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmButtonText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: '600',
  },
  cancelButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});