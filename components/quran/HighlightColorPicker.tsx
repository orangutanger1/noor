import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/providers/ThemeProvider';
import { HighlightColor, HIGHLIGHT_COLORS } from '@/types/quran';

interface HighlightColorPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectColor: (color: HighlightColor) => void;
  onRemoveHighlight: () => void;
  currentColor?: HighlightColor;
}

const colorOptions: { color: HighlightColor; label: string }[] = [
  { color: 'yellow', label: 'Yellow' },
  { color: 'green', label: 'Green' },
  { color: 'blue', label: 'Blue' },
  { color: 'pink', label: 'Pink' },
  { color: 'orange', label: 'Orange' },
];

export function HighlightColorPicker({
  visible,
  onClose,
  onSelectColor,
  onRemoveHighlight,
  currentColor,
}: HighlightColorPickerProps) {
  const { colors, isDark } = useTheme();

  const handleSelectColor = (color: HighlightColor) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectColor(color);
    onClose();
  };

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRemoveHighlight();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, { backgroundColor: colors.surface }]}>
              <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.text }]}>Highlight Color</Text>
                <TouchableOpacity onPress={onClose}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.colorGrid}>
                {colorOptions.map((option) => (
                  <TouchableOpacity
                    key={option.color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: HIGHLIGHT_COLORS[option.color] },
                      currentColor === option.color && styles.selectedOption,
                    ]}
                    onPress={() => handleSelectColor(option.color)}
                  >
                    {currentColor === option.color && (
                      <Check size={24} color="#333" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {currentColor && (
                <TouchableOpacity
                  style={[styles.removeButton, { borderColor: colors.missed }]}
                  onPress={handleRemove}
                >
                  <Text style={[styles.removeText, { color: colors.missed }]}>
                    Remove Highlight
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOption: {
    borderWidth: 3,
    borderColor: '#333',
  },
  removeButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  removeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
