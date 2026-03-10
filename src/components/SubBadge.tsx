import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { VertenteType, VertenteLevel } from '../types';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import clsx from 'clsx';

interface SubBadgeProps {
  type: VertenteType;
  level: VertenteLevel;
  small?: boolean;
}

export const SubBadge: React.FC<SubBadgeProps> = React.memo(({ type, level, small = false }) => {
  const config = VERTENTE_CONFIG[type];
  return (
    <LinearGradient
      colors={config.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className={clsx(
        'flex-row items-center gap-sm rounded-full px-md py-[6px] self-start',
        small && 'px-sm py-[4px]',
      )}
      accessibilityLabel={`${config.label} ${level}`}
    >
      <Text className="text-lg">{config.emoji}</Text>
      <View>
        <Text className={clsx('text-white text-base font-nunito', small && 'text-sm')}>
          {config.label}
        </Text>
      </View>
      {!small && (
        <View className="bg-[rgba(255,255,255,0.2)] rounded-full px-sm py-[2px] ml-[4px]">
          <Text className="text-white text-sm font-nunito-black">{level}</Text>
        </View>
      )}
    </LinearGradient>
  );
});
