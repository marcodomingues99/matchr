import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Spacing, Gradients } from '../theme';
import { AppHeader } from '../components/AppHeader';
import { GradientButton } from '../components/UI';

// Generic stub component
const StubScreen: React.FC<{ title: string; icon: string; desc: string }> = ({ title, icon, desc }) => {
  const navigation = useNavigation();
  return (
    <LinearGradient colors={Gradients.heroGradient as any} style={{ flex: 1 }}>
      <AppHeader title={title} showBack />
      <View style={styles.center}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{desc}</Text>
        <GradientButton label="← Voltar" onPress={() => navigation.goBack()} style={{ marginTop: 24 }} />
      </View>
    </LinearGradient>
  );
};

// ─── Exported stub screens ────────────────────────────────────────────────────

export const EditTournamentScreen: React.FC = () => (
  <StubScreen title="Editar Torneio" icon="✏️" desc="Editar os detalhes e configurações do torneio" />
);

export const AddTeamScreen: React.FC = () => (
  <StubScreen title="Adicionar Equipa" icon="👥" desc="Adicionar uma nova equipa ao torneio" />
);

export const EditTeamScreen: React.FC = () => (
  <StubScreen title="Editar Equipa" icon="✏️" desc="Editar detalhes da equipa" />
);

export const StandingsScreen: React.FC = () => (
  <StubScreen title="Classificação" icon="📊" desc="Tabela classificativa completa do torneio" />
);

export const BracketScreen: React.FC = () => (
  <StubScreen title="Eliminatória" icon="🏆" desc="Quadro de eliminatória e resultados" />
);

export const AdvancingTeamsScreen: React.FC = () => (
  <StubScreen title="Equipas Apuradas" icon="🎯" desc="Equipas que avançam para a fase seguinte" />
);

export const SettingsScreen: React.FC = () => (
  <StubScreen title="Definições" icon="⚙️" desc="Configurações da app Matchr" />
);

export const PlayerProfileScreen: React.FC = () => (
  <StubScreen title="Perfil do Jogador" icon="👤" desc="Estatísticas e histórico do jogador" />
);

export const TournamentHistoryScreen: React.FC = () => (
  <StubScreen title="Histórico" icon="📜" desc="Histórico de todos os torneios" />
);

export const ShareTournamentScreen: React.FC = () => (
  <StubScreen title="Partilhar Torneio" icon="📤" desc="Partilhar resultados e informações do torneio" />
);

export const PrintBracketScreen: React.FC = () => (
  <StubScreen title="Imprimir Quadro" icon="🖨️" desc="Imprimir ou exportar o quadro de jogo" />
);

export const RulesScreen: React.FC = () => (
  <StubScreen title="Regras" icon="📋" desc="Regras e regulamento do torneio" />
);

export const NotificationsScreen: React.FC = () => (
  <StubScreen title="Notificações" icon="🔔" desc="Centro de notificações e alertas" />
);

export const ScanQRScreen: React.FC = () => (
  <StubScreen title="Ler QR Code" icon="📷" desc="Ler código QR para entrar num torneio" />
);

export const AmericanoScreen: React.FC = () => (
  <StubScreen title="Americano" icon="🔄" desc="Formato americano — parceiros rotativos" />
);

export const MexicanoScreen: React.FC = () => (
  <StubScreen title="Mexicano" icon="🇲🇽" desc="Formato mexicano — emparelhamento por pontuação" />
);

export const AnalyticsScreen: React.FC = () => (
  <StubScreen title="Análise" icon="📈" desc="Estatísticas detalhadas do torneio" />
);

export const CoinTossScreen: React.FC = () => (
  <StubScreen title="Cara ou Coroa" icon="🪙" desc="Sorteio para definir quem serve primeiro" />
);

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: Spacing.xl,
  },
  title: {
    color: Colors.white,
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  desc: {
    color: Colors.gray300,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
});
