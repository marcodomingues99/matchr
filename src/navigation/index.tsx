import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import {
  HomeScreen, TournamentDetailScreen, CreateTournamentScreen,
  EditTournamentScreen, VertenteHubScreen, TeamListScreen,
  GroupsTableScreen, GroupsGamesScreen, KnockoutScreen,
  EnterResultScreen, GamePausedScreen, ConfirmCloseGameScreen,
  ConfirmCloseTournamentScreen,
  PodiumScreen, ExportScreen, ConfigureVertenteScreen,
  EditGameScreen, ManageTeamScreen, WithdrawConfirmScreen,
  FinishedTournamentScreen, GroupsEmptyScreen,
} from '../screens';

const Stack = createStackNavigator<RootStackParamList>();

export const Navigation = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CreateTournament" component={CreateTournamentScreen} />
      <Stack.Screen name="EditTournament" component={EditTournamentScreen} />
      <Stack.Screen name="TournamentDetail" component={TournamentDetailScreen} />
      <Stack.Screen name="UpcomingTournament" component={TournamentDetailScreen} />
      <Stack.Screen name="ConfigureVertente" component={ConfigureVertenteScreen} />
      <Stack.Screen name="VertenteHub" component={VertenteHubScreen} />
      <Stack.Screen name="ManageTeam" component={ManageTeamScreen} />
      <Stack.Screen name="EditTeam" component={ManageTeamScreen} />
      <Stack.Screen name="TeamList" component={TeamListScreen} />
      <Stack.Screen name="WithdrawConfirm" component={WithdrawConfirmScreen} />
      <Stack.Screen name="GroupsEmpty" component={GroupsEmptyScreen} />
      <Stack.Screen name="GroupsTable" component={GroupsTableScreen} />
      <Stack.Screen name="GroupsGames" component={GroupsGamesScreen} />
      <Stack.Screen name="Knockout" component={KnockoutScreen} />
      <Stack.Screen name="EditGame" component={EditGameScreen} />
      <Stack.Screen name="EnterResult" component={EnterResultScreen} />
      <Stack.Screen name="GamePaused" component={GamePausedScreen} />
      <Stack.Screen name="ConfirmCloseGame" component={ConfirmCloseGameScreen} />
      <Stack.Screen name="ConfirmCloseTournament" component={ConfirmCloseTournamentScreen} />
      <Stack.Screen name="Podium" component={PodiumScreen} />
      <Stack.Screen name="Export" component={ExportScreen} />
      <Stack.Screen name="FinishedTournament" component={FinishedTournamentScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
