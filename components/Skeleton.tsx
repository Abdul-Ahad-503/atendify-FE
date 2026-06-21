import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';

interface SkeletonProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  variant?: 'text' | 'card' | 'circle';
  animating?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.card,
  variant = 'card',
  animating = true,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width: typeof width === 'number' ? width : undefined,
          height: typeof height === 'number' ? height : undefined,
          borderRadius,
        },
      ]}
    >
      <ActivityIndicator
        animating={animating}
        size="small"
        color={Colors.surface}
        style={styles.indicator}
      />
    </View>
  );
};

export const SkeletonCard: React.FC<{ children?: React.ReactNode; loading?: boolean }> = ({
  children,
  loading = true,
}) => {
  if (!loading) return <>{children}</>;
  return (
    <View style={styles.cardSkeleton}>
      <Skeleton height={200} borderRadius={BorderRadius.card} />
    </View>
  );
};

export const SkeletonText: React.FC<{
  width?: string | number;
  height?: number;
  lines?: number;
  spacing?: number;
  loading?: boolean;
}> = ({
  width = '100%',
  height = 16,
  lines = 1,
  spacing = Spacing.md,
  loading = true,
}) => {
  if (!loading) return null;

  const lineStyles = [
    styles.textLine,
    {
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined,
    },
  ];

  return (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <View key={index} style={[lineStyles, index > 0 && { marginTop: spacing }]}>
          <ActivityIndicator
            animating={loading}
            size="small"
            color={Colors.surface}
            style={styles.indicator}
          />
        </View>
      ))}
    </View>
  );
};

export const SkeletonList: React.FC<{
  count?: number;
  itemHeight?: number;
  itemWidth?: number;
}> = ({ count = 5, itemHeight = 120, itemWidth = '100%' }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.listItem, { width: itemWidth }]}>
          <Skeleton height={itemHeight} borderRadius={BorderRadius.card} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.background,
    overflow: 'hidden',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardSkeleton: {
    padding: Spacing.md,
  },
  textContainer: {
    width: '100%',
  },
  textLine: {
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  listContainer: {
    gap: Spacing.md,
  },
  listItem: {
    height: 120,
  },
});