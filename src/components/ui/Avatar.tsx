/**
 * Avatar Component
 * User profile pictures and initials
 */

import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../theme';

type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

interface AvatarProps {
  source?: { uri: string } | number;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
  backgroundColor?: string;
}

export default function Avatar({
  source,
  name,
  size = 'medium',
  style,
  backgroundColor,
}: AvatarProps) {
  const sizeStyles = {
    small: { width: 32, height: 32, fontSize: 14 },
    medium: { width: 48, height: 48, fontSize: 18 },
    large: { width: 64, height: 64, fontSize: 24 },
    xlarge: { width: 96, height: 96, fontSize: 36 },
  };

  const sizeStyle = sizeStyles[size];

  // Get initials from name
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // Generate color from name
  const getColorFromName = (name: string): string => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const containerStyle: ViewStyle = {
    width: sizeStyle.width,
    height: sizeStyle.height,
    borderRadius: sizeStyle.width / 2,
    backgroundColor: backgroundColor || (name ? getColorFromName(name) : colors.background.gray200),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  };

  if (source) {
    return (
      <View style={[containerStyle, style]}>
        <Image
          source={source}
          style={[styles.image, { width: sizeStyle.width, height: sizeStyle.height }]}
          resizeMode="cover"
        />
      </View>
    );
  }

  if (name) {
    return (
      <View style={[containerStyle, style]}>
        <Text
          style={[
            styles.initials,
            { fontSize: sizeStyle.fontSize, color: colors.text.inverse },
          ]}
        >
          {getInitials(name)}
        </Text>
      </View>
    );
  }

  // Placeholder avatar
  return (
    <View style={[containerStyle, style]}>
      <Text style={[styles.initials, { fontSize: sizeStyle.fontSize, color: colors.text.disabled }]}>
        ?
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontFamily: typography.fonts.bodyBold,
    fontWeight: '700',
  },
});