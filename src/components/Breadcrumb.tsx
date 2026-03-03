import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Shadows } from '../theme';

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
    <View style={s.row}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }} style={s.backBtn}>
            <Text style={s.backTxt}>← {backLabel}</Text>
        </TouchableOpacity>
    </View>
));

/**
 * Floating 🏠 button — bottom-right corner.
 * Navigates straight to the Home screen from anywhere in the app.
 */
export const HomeFAB: React.FC<{ onPress: () => void }> = React.memo(({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={fab.btn} activeOpacity={0.8}>
        <Text style={fab.icon}>🏠</Text>
    </TouchableOpacity>
));

const s = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 8,
        marginBottom: 8,
    },
    backBtn: {
        flexShrink: 1,
    },
    backTxt: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamilyBold,
    },
});

const fab = StyleSheet.create({
    btn: {
        position: 'absolute',
        bottom: 28,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.navyAlpha90,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.header,
    },
    icon: {
        fontSize: Typography.fontSize.xxxl,
    },
});
