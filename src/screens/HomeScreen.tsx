import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { RootStackParamList, Tournament, Vertente } from '../types';
import { mockTournaments } from '../mock/data';
import { Colors, Gradients } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { LiveDot } from '../components/LiveDot';
import { Container, Grid, GridItem } from '../components/Layout';
import { parseDatePt, STATUS_LABEL, PHASE_WEIGHT, PHASE_ORDER } from '../utils/constants';

type Nav = StackNavigationProp<RootStackParamList, 'Home'>;

const logo = require('../../assets/logo.png');

const chipLabel = (v: Vertente) =>
  v.level === 'Sem' ? v.type : v.level;

/* ── Shared header ── */
const HomeHeader = ({ right }: { right?: React.ReactNode }) => (
  <Container className="flex-row justify-between items-center pt-[8px]">
    <View className="flex-row items-center gap-[10px]">
      <Image source={logo} style={{ width: 34, height: 34 }} resizeMode="contain" />
      <View>
        <Text className="text-white text-[24px] md:text-[32px] font-nunito-black leading-[28px] md:leading-[36px]">Matchr</Text>
        <Text className="text-white/70 text-md md:text-lg font-nunito-semibold mt-[1px]">Os teus torneios</Text>
      </View>
    </View>
    {right}
  </Container>
);

export const HomeScreen = () => {
  const navigation = useNavigation<Nav>();
  const tournaments = mockTournaments;
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const active   = React.useMemo(() => tournaments.filter(t => t.status === 'active'),   [tournaments]);
  const upcoming = React.useMemo(() => tournaments.filter(t => t.status === 'upcoming'), [tournaments]);
  const finished = React.useMemo(() => tournaments.filter(t => t.status === 'finished'), [tournaments]);

  /* ── Empty state ── */
  if (tournaments.length === 0) {
    return (
      <LinearGradient colors={Gradients.header} className="flex-1">
        <SafeAreaView className="flex-1">
          <View className="px-lg pt-sm">
            <HomeHeader />
          </View>
          <Container className="flex-1 items-center justify-center px-xl">
            <View className="w-[96px] md:w-[120px] h-[96px] md:h-[120px] bg-white/15 rounded-2xl items-center justify-center mb-xl">
              <Image source={logo} style={{ width: 56, height: 56 }} resizeMode="contain" />
            </View>
            <Text className="text-white text-3xl md:text-[28px] font-nunito-black mb-[8px]">Ainda sem torneios</Text>
            <Text className="text-white/75 text-lg md:text-xl font-nunito-semibold text-center leading-[22px] md:leading-[26px] mb-xl">
              Cria o teu primeiro torneio e começa a gerir{'\n'}grupos, eliminatórias
              e resultados.
            </Text>
            <TouchableOpacity
              className="bg-navy-dark rounded-lg px-[28px] md:px-[36px] py-[14px] md:py-lg"
              activeOpacity={0.85}
              onPress={() => navigation.navigate('CreateTournament')}
            >
              <Text className="text-white text-lg md:text-xl font-nunito">+ Criar primeiro torneio</Text>
            </TouchableOpacity>
          </Container>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const newButton = (
    <TouchableOpacity
      className="bg-green rounded-md px-lg md:px-xl py-sm md:py-md min-h-[44px] md:min-h-[48px] justify-center"
      activeOpacity={0.8}
      onPress={() => navigation.navigate('CreateTournament')}
    >
      <Text className="text-white text-base md:text-lg font-nunito">+ Novo</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gbg">
      <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
        <SafeAreaView edges={['top']}>
          <HomeHeader right={newButton} />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-lg pt-md"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} colors={[Colors.blue]} />
        }
      >
        <Container>
          {/* Em Curso */}
          {active.length > 0 && (
            <>
              <View className="flex-row justify-between items-center mb-sm" accessibilityRole="header">
                <Text className="text-lg md:text-xl font-nunito text-navy">Em Curso</Text>
                <View className="flex-row items-center gap-xs" accessibilityLabel="Torneios ao vivo">
                  <LiveDot size={8} color={Colors.red} />
                  <Text className="text-md font-nunito text-blue">Ao vivo</Text>
                </View>
              </View>
              <Grid gap="md">
                {active.map((t) => (
                  <GridItem key={t.id} cols={{ sm: 1, md: 2 }}>
                    <ActiveCard t={t} nav={navigation} />
                  </GridItem>
                ))}
              </Grid>
            </>
          )}

          {/* Próximos */}
          {upcoming.length > 0 && (
            <>
              <Text className="text-lg md:text-xl font-nunito text-navy mb-sm mt-md" accessibilityRole="header">Próximos</Text>
              <Grid gap="sm">
                {upcoming.map((t) => (
                  <GridItem key={t.id} cols={{ sm: 1, md: 2, lg: 3 }}>
                    <CompactCard t={t} nav={navigation} />
                  </GridItem>
                ))}
              </Grid>
            </>
          )}

          {/* Concluídos */}
          {finished.length > 0 && (
            <>
              <Text className="text-lg md:text-xl font-nunito text-navy mb-sm mt-md" accessibilityRole="header">Concluídos</Text>
              <Grid gap="sm">
                {finished.map((t) => (
                  <GridItem key={t.id} cols={{ sm: 1, md: 2, lg: 3 }}>
                    <CompactCard t={t} nav={navigation} />
                  </GridItem>
                ))}
              </Grid>
            </>
          )}

          <View className="h-2xl" />
        </Container>
      </ScrollView>
    </View>
  );
};

/* ═════════════════════════════════════════════════════════════
   Active card
   ═════════════════════════════════════════════════════════════ */
const ActiveCard = React.memo(({ t, nav }: { t: Tournament; nav: Nav }) => {
  const start = parseDatePt(t.startDate);
  const end = parseDatePt(t.endDate);
  const now = new Date();
  const totalDays = start && end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1) : 1;
  const currentDay = start ? Math.min(totalDays, Math.max(1, Math.round((now.getTime() - start.getTime()) / 86400000) + 1)) : 1;

  const progress = t.vertentes.length > 0
    ? t.vertentes.reduce((sum, v) => sum + (PHASE_WEIGHT[v.status] ?? 0), 0) / t.vertentes.length
    : 0;

  const maxPhase = t.vertentes.reduce<string>((best, v) => {
    const idx = PHASE_ORDER.indexOf(v.status);
    return idx > PHASE_ORDER.indexOf(best as typeof v.status) ? v.status : best;
  }, PHASE_ORDER[0]);
  const roundLabel = STATUS_LABEL[maxPhase] ?? 'Em preparação';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className="mb-lg"
      onPress={() => nav.navigate('TournamentDetail', { tournamentId: t.id })}
      accessibilityRole="button"
      accessibilityLabel={`Torneio ${t.name}, ${t.location}, ${roundLabel}, ${Math.round(progress * 100)}% concluído`}
      accessibilityHint="Toca para ver detalhes do torneio"
    >
      <View className="bg-white rounded-xl overflow-hidden shadow-card">
        <ImageBackground
          source={t.photo ? { uri: t.photo } : undefined}
          className="h-[76px] md:h-[100px] flex-row items-center px-lg overflow-hidden"
          imageStyle={{ resizeMode: 'cover' }}
        >
          <LinearGradient
            colors={t.photo
              ? ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.25)']
              : [Colors.navy, Colors.blue, Colors.teal]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="absolute inset-0"
          />
          <Text className="text-white text-lg md:text-xl font-nunito-black flex-1 z-[1]">{t.name}</Text>
          <Text className="absolute text-[50px] opacity-[0.08] right-[12px] bottom-[4px]">🏆</Text>
        </ImageBackground>

        <View className="p-md">
          <Text className="text-muted text-sm font-nunito-semibold mb-[6px]">
            📍 {t.location} · {t.startDate}–{t.endDate}
          </Text>

          <View className="flex-row flex-wrap gap-xs mb-md">
            {t.vertentes.map((v) => (
              <TouchableOpacity
                key={v.id}
                className="rounded-full px-sm py-[3px]"
                style={{ backgroundColor: VERTENTE_CONFIG[v.type].chipBg }}
                activeOpacity={0.7}
                onPress={() => nav.navigate('VertenteHub', { tournamentId: t.id, vertenteId: v.id })}
              >
                <Text className="text-sm font-nunito" style={{ color: VERTENTE_CONFIG[v.type].chipText }}>
                  {chipLabel(v)}
                </Text>
              </TouchableOpacity>
            ))}
            <View className="rounded-full px-sm py-[3px] bg-green-bg-light">
              <Text className="text-sm font-nunito text-green-deep">
                Dia {currentDay}/{totalDays}
              </Text>
            </View>
          </View>

          <View className="h-[4px] rounded-[2px] bg-gl overflow-hidden mt-[8px]">
            <LinearGradient
              colors={Gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-full rounded-[2px]"
              style={{ width: `${progress * 100}%` as `${number}%` }}
            />
          </View>
          <View className="flex-row justify-between items-center mt-[3px]">
            <Text className="text-muted text-xs font-nunito-semibold">
              {t.vertentes.length} categorias · {roundLabel}
            </Text>
            <Text className="text-blue text-xs font-nunito">{Math.round(progress * 100)}%</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

/* ═════════════════════════════════════════════════════════════
   Compact card
   ═════════════════════════════════════════════════════════════ */
const CompactCard = React.memo(({ t, nav }: { t: Tournament; nav: Nav }) => {
  const target = t.status === 'upcoming' ? 'UpcomingTournament' : t.status === 'finished' ? 'FinishedTournament' : 'TournamentDetail';
  const isFinished = t.status === 'finished';

  return (
    <TouchableOpacity
      className={clsx(
        'flex-row items-center bg-white rounded-xl p-md mb-sm shadow-card',
        isFinished && 'opacity-70',
      )}
      activeOpacity={0.85}
      onPress={() => nav.navigate(target, { tournamentId: t.id })}
      accessibilityRole="button"
      accessibilityLabel={`Torneio ${t.name}, ${t.location}${isFinished ? ', concluído' : ''}`}
      accessibilityHint="Toca para ver detalhes do torneio"
    >
      {t.photo ? (
        <View className="w-[46px] h-[46px] rounded-[23px] items-center justify-center mr-[12px] overflow-hidden">
          <Image source={{ uri: t.photo }} style={{ width: 46, height: 46 }} resizeMode="cover" />
        </View>
      ) : isFinished ? (
        <View className="w-[46px] h-[46px] rounded-[23px] items-center justify-center mr-[12px] bg-gl">
          <Image source={logo} style={{ width: 26, height: 26, opacity: 0.4 }} resizeMode="contain" />
        </View>
      ) : (
        <LinearGradient
          colors={[Colors.orange, Colors.yellow]}
          className="w-[46px] h-[46px] rounded-[23px] items-center justify-center mr-[12px]"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image source={logo} style={{ width: 26, height: 26 }} resizeMode="contain" />
        </LinearGradient>
      )}

      <View className="flex-1">
        <Text className={clsx('text-lg md:text-xl font-nunito text-navy', isFinished && 'text-muted')}>
          {t.name}
        </Text>
        <Text className={clsx('text-sm font-nunito-semibold text-gray-slate mt-[2px]', isFinished && 'text-gray')}>
          📍 {t.location} · {t.startDate}
          {t.endDate !== t.startDate ? `–${t.endDate}` : ''}
        </Text>
        <View className="flex-row flex-wrap gap-[4px] mt-[6px]">
          {t.vertentes.map((v) => isFinished ? (
            <View
              key={v.id}
              className="rounded-full px-[8px] py-[2px]"
              style={{ backgroundColor: Colors.gray }}
            >
              <Text className="text-white/80 text-xs font-nunito">
                {chipLabel(v)}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              key={v.id}
              className="rounded-full px-[8px] py-[2px]"
              style={{ backgroundColor: VERTENTE_CONFIG[v.type].color }}
              activeOpacity={0.7}
              onPress={() => nav.navigate('VertenteHub', { tournamentId: t.id, vertenteId: v.id })}
            >
              <Text className="text-white text-xs font-nunito">
                {chipLabel(v)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text className={clsx('text-3xl text-gray font-nunito-regular ml-[4px]', isFinished && 'text-gl')}>›</Text>
    </TouchableOpacity>
  );
});
