import React from 'react';
import { View } from 'react-native';
import clsx from 'clsx';

/**
 * Container — centers content with max-width on web, full-width on mobile.
 */
export const Container = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <View className={clsx('max-w-content self-center w-full', className)}>
    {children}
  </View>
);

/**
 * Grid — responsive flex-wrap container.
 * gap: spacing between items (default: sm = 8px)
 */
export const Grid = ({
  children,
  gap = 'sm',
  className,
}: {
  children: React.ReactNode;
  gap?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}) => (
  <View
    className={clsx(
      'flex-row flex-wrap',
      gap === 'xs' && 'gap-xs',
      gap === 'sm' && 'gap-sm',
      gap === 'md' && 'gap-md',
      gap === 'lg' && 'gap-lg',
      className,
    )}
  >
    {children}
  </View>
);

/**
 * GridItem — responsive column widths.
 *
 * cols defines how many columns at each breakpoint:
 *   { sm: 1, md: 2, lg: 3 }
 *   → full width on mobile, 2 cols on tablet, 3 cols on desktop
 *
 * Uses flex-1 + min/max-width so items grow naturally
 * and don't look tiny when there are fewer items than cols.
 */
export const GridItem = ({
  children,
  cols = { sm: 1, md: 2 },
  className,
}: {
  children: React.ReactNode;
  cols?: { sm?: 1 | 2 | 3 | 4; md?: 1 | 2 | 3 | 4; lg?: 1 | 2 | 3 | 4 };
  className?: string;
}) => {
  const sm = cols.sm ?? 1;
  const md = cols.md ?? sm;
  const lg = cols.lg ?? md;

  return (
    <View
      className={clsx(
        // Mobile
        sm === 1 && 'w-full',
        // Tablet
        md === 1 && 'md:w-full',
        md === 2 && 'md:flex-1 md:min-w-[280px] md:max-w-[580px]',
        md === 3 && 'md:flex-1 md:min-w-[240px] md:max-w-[380px]',
        md === 4 && 'md:flex-1 md:min-w-[200px] md:max-w-[280px]',
        // Desktop
        lg === 1 && 'lg:w-full',
        lg === 2 && 'lg:min-w-[280px] lg:max-w-[580px]',
        lg === 3 && 'lg:min-w-[240px] lg:max-w-[380px]',
        lg === 4 && 'lg:min-w-[200px] lg:max-w-[280px]',
        className,
      )}
    >
      {children}
    </View>
  );
};
