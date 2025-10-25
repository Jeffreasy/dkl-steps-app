import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { apiFetch } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, shadows, components } from '../theme';

interface RouteFund {
  id: string;
  route: string;
  amount: number;
}

export default function AdminFundsScreen() {
  const navigation = useNavigation<any>();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [route, setRoute] = useState('');
  const [amount, setAmount] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAccess = async () => {
      const rol = await AsyncStorage.getItem('userRole');
      const normalizedRole = (rol || '').toLowerCase();
      
      if (normalizedRole === 'admin') {
        setHasAccess(true);
      } else {
        Alert.alert(
          'Toegang Geweigerd',
          'Alleen Admins hebben toegang tot deze functie',
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
      }
      setIsChecking(false);
    };
    checkAccess();
  }, [navigation]);

  const { data: fundsList, isLoading, error: fundsError } = useQuery({
    queryKey: ['adminRouteFunds'],
    queryFn: async () => {
      console.log('Fetching admin route funds...');
      const result = await apiFetch('/steps/admin/route-funds');
      console.log('Route funds response:', result);
      return result;
    },
    enabled: hasAccess,
    retry: 2,
  });

  const createMut = useMutation({
    mutationFn: (body: { route: string; amount: number }) => 
      apiFetch('/steps/admin/route-funds', { 
        method: 'POST', 
        body: JSON.stringify(body) 
      }),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
      queryClient.invalidateQueries({ queryKey: ['fundsDistribution'] });
      setRoute(''); 
      setAmount('');
      Alert.alert('Succes', 'Route toegevoegd');
    },
    onError: (error: any) => {
      Alert.alert('Fout', error.message);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ r, body }: { r: string; body: { amount: number } }) => 
      apiFetch(`/steps/admin/route-funds/${encodeURIComponent(r)}`, { 
        method: 'PUT', 
        body: JSON.stringify(body) 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
      queryClient.invalidateQueries({ queryKey: ['fundsDistribution'] });
      Alert.alert('Succes', 'Route bijgewerkt');
    },
    onError: (error: any) => {
      Alert.alert('Fout', error.message);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (r: string) => 
      apiFetch(`/steps/admin/route-funds/${encodeURIComponent(r)}`, { 
        method: 'DELETE' 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
      queryClient.invalidateQueries({ queryKey: ['fundsDistribution'] });
      Alert.alert('Succes', 'Route verwijderd');
    },
    onError: (error: any) => {
      Alert.alert('Fout', error.message);
    },
  });

  const handleCreate = () => {
    const parsedAmount = parseInt(amount);
    if (!route.trim()) {
      Alert.alert('Validatie', 'Voer een route naam in');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      Alert.alert('Validatie', 'Voer een geldig bedrag in');
      return;
    }
    createMut.mutate({ route: route.trim(), amount: parsedAmount });
  };

  const handleUpdate = (item: RouteFund, increment: number) => {
    const newAmount = item.amount + increment;
    if (newAmount < 0) {
      Alert.alert('Validatie', 'Bedrag kan niet negatief zijn');
      return;
    }
    updateMut.mutate({ r: item.route, body: { amount: newAmount } });
  };

  const handleDelete = (item: RouteFund) => {
    Alert.alert(
      'Bevestigen',
      `Weet je zeker dat je "${item.route}" wilt verwijderen?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Verwijderen', 
          style: 'destructive',
          onPress: () => deleteMut.mutate(item.route)
        },
      ]
    );
  };

  if (isChecking) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loading}>Toegang controleren...</Text>
      </View>
    );
  }

  if (!hasAccess) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>Geen toegang (403)</Text>
        <Text style={styles.errorDetail}>Alleen Admins hebben toegang</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loading}>Routes laden...</Text>
      </View>
    );
  }

  // Show error state
  if (fundsError) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin: Route Funds Beheer</Text>
          <Text style={styles.subtitle}>CRUD operaties voor route fondsen</Text>
        </View>
        
        <View style={styles.errorCard}>
          <Text style={styles.error}>⚠️ Fout bij laden routes</Text>
          <Text style={styles.errorDetail}>{(fundsError as Error).message}</Text>
          <Button
            title="Opnieuw Proberen"
            onPress={() => queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] })}
            color="#FF9800"
          />
          <Text style={styles.debugText}>
            Endpoint: GET /steps/admin/route-funds{'\n'}
            Check backend logs voor details
          </Text>
        </View>
      </ScrollView>
    );
  }

  console.log('Rendering AdminFunds with data:', fundsList);

  return (
    <ScrollView style={styles.container}>
      <View>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/dkl-logo.webp')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <LinearGradient
          colors={[colors.status.warning, '#e67f1c']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerIcon}>⚙️</Text>
            <Text style={styles.title}>Route Funds Beheer</Text>
          </View>
          <Text style={styles.subtitle}>CRUD operaties voor route fondsen</Text>
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Bestaande Routes {fundsList ? `(${fundsList.length})` : ''}
        </Text>
        
        {/* Debug info */}
        <Text style={styles.debugInfo}>
          Data type: {Array.isArray(fundsList) ? 'Array' : typeof fundsList}{'\n'}
          Length: {fundsList?.length ?? 'undefined'}
        </Text>
        
        {fundsList && Array.isArray(fundsList) && fundsList.length > 0 ? (
          <View>
            {fundsList.map((item: RouteFund) => (
              <View key={item.id} style={styles.item}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemRoute}>{item.route}</Text>
                  <Text style={styles.itemAmount}>€{item.amount}</Text>
                </View>
                <View style={styles.itemActions}>
                  <View style={styles.actionButton}>
                    <Button 
                      title="-10" 
                      onPress={() => handleUpdate(item, -10)} 
                      color="#f44336"
                      disabled={updateMut.isPending}
                    />
                  </View>
                  <View style={styles.actionButton}>
                    <Button 
                      title="+10" 
                      onPress={() => handleUpdate(item, 10)} 
                      color="#4CAF50"
                      disabled={updateMut.isPending}
                    />
                  </View>
                  <View style={styles.actionButton}>
                    <Button 
                      title="🗑️" 
                      onPress={() => handleDelete(item)} 
                      color="#9E9E9E"
                      disabled={deleteMut.isPending}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Geen routes gevonden</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nieuwe Route Toevoegen</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Route (bijv. 5 KM)" 
          value={route} 
          onChangeText={setRoute}
          editable={!createMut.isPending}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Bedrag (€)" 
          value={amount} 
          onChangeText={setAmount} 
          keyboardType="numeric"
          editable={!createMut.isPending}
        />
        <Button 
          title={createMut.isPending ? "Toevoegen..." : "Toevoegen"} 
          onPress={handleCreate} 
          disabled={!route || !amount || createMut.isPending}
          color="#FF9800"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.subtle,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  logoContainer: {
    backgroundColor: colors.background.paper,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  headerLogo: {
    width: 240,
    height: 75,
  },
  header: {
    padding: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: spacing.radius.xl,
    borderBottomRightRadius: spacing.radius.xl,
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    fontSize: 32,
  },
  title: {
    ...typography.styles.h3,
    fontFamily: typography.fonts.heading,
    color: colors.text.inverse,
  },
  subtitle: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
  },
  section: {
    ...components.card.elevated,
    margin: spacing.lg,
    borderTopWidth: 3,
    borderTopColor: colors.status.warning,
  },
  sectionTitle: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    marginBottom: spacing.lg,
    color: colors.text.primary,
  },
  item: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  itemRoute: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '500',
    color: colors.text.primary,
  },
  itemAmount: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.headingBold,
    fontWeight: 'bold',
    color: colors.primary,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  actionButton: {
    minWidth: 60,
  },
  input: {
    ...components.input.base,
    marginVertical: spacing.sm,
    fontFamily: typography.fonts.body,
  },
  emptyText: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    color: colors.text.disabled,
    fontStyle: 'italic',
    paddingVertical: spacing.lg,
  },
  loading: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    marginTop: spacing.md,
    color: colors.text.secondary,
  },
  error: {
    color: colors.status.error,
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  errorDetail: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  errorCard: {
    ...components.card.elevated,
    margin: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.error,
  },
  debugText: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.background.gray50,
    borderRadius: spacing.radius.sm,
    ...typography.styles.caption,
    fontFamily: typography.fonts.mono,
    color: colors.text.secondary,
  },
  debugInfo: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.mono,
    color: colors.secondary,
    backgroundColor: `${colors.secondary}1A`,
    padding: spacing.sm,
    borderRadius: spacing.radius.sm,
    marginBottom: spacing.md,
  },
});