import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon size={22} color={Colors.light.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.light.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  description: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
});
