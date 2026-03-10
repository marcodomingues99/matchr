import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface HeaderNavProps {
    /** Text shown next to ←, e.g. "Masc M5" */
    backLabel: string;
    /** Navigates to the logical parent in the app hierarchy */
    onBack: () => void;
}

/**
 * ← backLabel
 *
 * Navigates to the logical parent screen (not browser-like goBack).
 */
export const HeaderNav: React.FC<HeaderNavProps> = React.memo(({ backLabel, onBack }) => (
    <View className="flex-row items-center pt-sm mb-sm">
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }} className="shrink" accessibilityRole="button" accessibilityLabel={`Voltar para ${backLabel}`}>
            <Text className="text-[rgba(255,255,255,0.75)] text-base font-nunito-bold">← {backLabel}</Text>
        </TouchableOpacity>
    </View>
));

/**
 * Floating 🏠 button — bottom-right corner.
 * Navigates straight to the Home screen from anywhere in the app.
 */
export const HomeFAB: React.FC<{ onPress: () => void }> = React.memo(({ onPress }) => (
    <TouchableOpacity onPress={onPress} className="absolute bottom-[28px] right-[20px] w-[50px] h-[50px] rounded-[25px] bg-navy-alpha-90 items-center justify-center shadow-header" activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Ir para página inicial">
        <Text className="text-3xl">🏠</Text>
    </TouchableOpacity>
));
