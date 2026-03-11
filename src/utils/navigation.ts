import { StackActions, CommonActions } from '@react-navigation/native';
import type { RootStackParamList } from '../types';

/**
 * Returns a dispatch action that pops the stack back to the named screen.
 * Usage: `navigation.dispatch(popTo('TournamentDetail'))`
 */
export const popTo = (screenName: keyof RootStackParamList) =>
  (state: { routes: { name: string }[] }) => {
    for (let i = state.routes.length - 1; i >= 0; i--) {
      if (state.routes[i].name === screenName) {
        return StackActions.pop(state.routes.length - 1 - i);
      }
    }
    return CommonActions.goBack();
  };
