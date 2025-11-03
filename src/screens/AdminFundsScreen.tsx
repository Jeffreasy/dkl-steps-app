import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState, useCallback, memo } from 'react';
import { apiFetch } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, components } from '../theme';
import type { NavigationProp, RouteFund } from '../types';
import { getErrorMessage } from '../types';
import { ScreenHeader, LoadingScreen, CustomButton } from '../components/ui';
import { RoutesList, AddRouteForm } from '../components/admin';
import { logger } from '../utils/logger';
import { transformRouteFundsResponse } from '../utils/apiHelpers';
import { useRequireAdmin } from '../hooks';

function AdminFundsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [route, setRoute] = useState('');
  const [amount, setAmount] = useState('');
  const queryClient = useQueryClient();
  
  // Use custom access control hook - only admins allowed
  const { hasAccess, isChecking } = useRequireAdmin();

  const { data: fundsList, isLoading, error: fundsError } = useQuery<RouteFund[]>({
    queryKey: ['adminRouteFunds'],
    queryFn: async () => {
      logger.api('GET', '/steps/admin/route-funds');
      const result = await apiFetch<any>('/steps/admin/route-funds');
      logger.debug('Route funds raw response:', result);
      
      // Use utility function to transform and validate
      return transformRouteFundsResponse(result);
    },
    enabled: hasAccess && !isChecking,
    retry: 2,
    staleTime: 30000, // 30 seconds
    refetchOnMount: true,
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
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      Alert.alert('Fout', message);
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
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      Alert.alert('Fout', message);
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
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      Alert.alert('Fout', message);
    },
  });

  const handleCreate = useCallback(() => {
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
  }, [route, amount, createMut]);

  const handleUpdate = useCallback((item: RouteFund, increment: number) => {
    const newAmount = item.amount + increment;
    if (newAmount < 0) {
      Alert.alert('Validatie', 'Bedrag kan niet negatief zijn');
      return;
    }
    updateMut.mutate({ r: item.route, body: { amount: newAmount } });
  }, [updateMut]);

  const handleDelete = useCallback((item: RouteFund) => {
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
  }, [deleteMut]);

  if (isChecking) {
    return <LoadingScreen message="Toegang controleren..." color={colors.status.warning} />;
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
    return <LoadingScreen message="Routes laden..." color={colors.status.warning} />;
  }

  // Show error state
  if (fundsError) {
    return (
      <ScrollView style={styles.container}>
        <ScreenHeader
          title="Route Funds Beheer"
          subtitle="CRUD operaties voor route fondsen"
          gradientColors={[colors.status.warning, '#e67f1c']}
          icon="⚙️"
        />
        
        <View style={styles.errorCard}>
          <Text style={styles.error}>⚠️ Fout bij laden routes</Text>
          <Text style={styles.errorDetail}>{(fundsError as Error).message}</Text>
          <CustomButton
            title="Opnieuw Proberen"
            onPress={() => queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] })}
            variant="secondary"
            style={{ marginTop: spacing.md }}
          />
          <Text style={styles.debugText}>
            Endpoint: GET /steps/admin/route-funds{'\n'}
            Check backend logs voor details
          </Text>
        </View>
      </ScrollView>
    );
  }

  logger.debug('Rendering AdminFunds with data:', fundsList);

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader
        title="Route Funds Beheer"
        subtitle="CRUD operaties voor route fondsen"
        gradientColors={[colors.status.warning, '#e67f1c']}
        icon="⚙️"
      />

      <RoutesList
        routes={fundsList || []}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isUpdating={updateMut.isPending}
        isDeleting={deleteMut.isPending}
        showDebug={true}
      />

      <AddRouteForm
        route={route}
        amount={amount}
        onRouteChange={setRoute}
        onAmountChange={setAmount}
        onSubmit={handleCreate}
        isSubmitting={createMut.isPending}
      />
    </ScrollView>
  );
}

// Export memoized version
export default memo(AdminFundsScreen);

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
});