import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

// Main screens
import { HomeScreen } from '../screens/HomeScreen';
import { TournamentDetailScreen } from '../screens/TournamentDetailScreen';
import { GroupsGamesScreen } from '../screens/GroupsGamesScreen';
import { EnterResultScreen } from '../screens/EnterResultScreen';
import { CreateTournamentScreen } from '../screens/CreateTournamentScreen';
import { ManageTeamsScreen } from '../screens/ManageTeamsScreen';

// Stubs
import {
  EditTournamentScreen,
  AddTeamScreen,
  EditTeamScreen,
  StandingsScreen,
  BracketScreen,
  AdvancingTeamsScreen,
  SettingsScreen,
  PlayerProfileScreen,
  TournamentHistoryScreen,
  ShareTournamentScreen,
  PrintBracketScreen,
  RulesScreen,
  NotificationsScreen,
  ScanQRScreen,
  AmericanoScreen,
  MexicanoScreen,
  AnalyticsScreen,
  CoinTossScreen,
} from '../screens/StubScreens';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CreateTournament" component={CreateTournamentScreen} />
      <Stack.Screen name="TournamentDetail" component={TournamentDetailScreen} />
      <Stack.Screen name="EditTournament" component={EditTournamentScreen} />
      <Stack.Screen name="ManageTeams" component={ManageTeamsScreen} />
      <Stack.Screen name="AddTeam" component={AddTeamScreen} />
      <Stack.Screen name="EditTeam" component={EditTeamScreen} />
      <Stack.Screen name="GroupsGames" component={GroupsGamesScreen} />
      <Stack.Screen name="EnterResult" component={EnterResultScreen} />
      <Stack.Screen name="Standings" component={StandingsScreen} />
      <Stack.Screen name="Bracket" component={BracketScreen} />
      <Stack.Screen name="AdvancingTeams" component={AdvancingTeamsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PlayerProfile" component={PlayerProfileScreen} />
      <Stack.Screen name="TournamentHistory" component={TournamentHistoryScreen} />
      <Stack.Screen name="ShareTournament" component={ShareTournamentScreen} />
      <Stack.Screen name="PrintBracket" component={PrintBracketScreen} />
      <Stack.Screen name="Rules" component={RulesScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ScanQR" component={ScanQRScreen} />
      <Stack.Screen name="Americano" component={AmericanoScreen} />
      <Stack.Screen name="Mexicano" component={MexicanoScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="CoinToss" component={CoinTossScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
