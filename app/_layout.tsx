import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="tournament/[id]" />
          <Stack.Screen name="tournament/create" />
          <Stack.Screen name="tournament/[id]/vertente/[vid]" />
          <Stack.Screen name="tournament/[id]/vertente/[vid]/teams" />
          <Stack.Screen name="tournament/[id]/vertente/[vid]/groups" />
          <Stack.Screen name="tournament/[id]/vertente/[vid]/bracket" />
          <Stack.Screen name="tournament/[id]/vertente/[vid]/match/[mid]" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
