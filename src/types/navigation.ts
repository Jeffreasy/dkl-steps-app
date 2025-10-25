/**
 * Navigation Type Definitions
 * Centrale type definitions voor React Navigation
 */

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

/**
 * Root Stack Parameter List
 * Definieert alle screens en hun parameters
 */
export type RootStackParamList = {
  Login: undefined;
  ChangePassword: undefined;
  Dashboard: undefined;
  GlobalDashboard: undefined;
  DigitalBoard: undefined;
  AdminFunds: undefined;
};

/**
 * Generic Navigation Prop
 * Gebruik dit voor navigation in components
 * 
 * @example
 * const navigation = useNavigation<NavigationProp>();
 * navigation.navigate('Dashboard');
 */
export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Typed Screen Props
 * Gebruik dit voor screen components met route params
 * 
 * @example
 * type Props = ScreenProps<'Login'>;
 * const LoginScreen = ({ navigation, route }: Props) => { ... }
 */
export type ScreenProps<T extends keyof RootStackParamList> = {
  navigation: NativeStackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};