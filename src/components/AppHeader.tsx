import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Gradients, Spacing } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export default function AppHeader({ title, subtitle, onBack, rightElement }: Props) {
  const navigation = useNavigation();
  const handleBack = onBack ?? (() => navigation.goBack());
  return (
    <LinearGradient colors={Gradients.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <SafeAreaView edges={['top']} style={s.container}>
        <View style={s.row}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={s.back}>← Voltar</Text>
          </TouchableOpacity>
          {rightElement ?? <View style={{ width: 70 }} />}
        </View>
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  back: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Nunito_700Bold', paddingTop: 8 },
  title: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_900Black', marginTop: 4 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
});
