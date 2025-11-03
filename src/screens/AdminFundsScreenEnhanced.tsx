/**
 * AdminFundsScreen Enhanced
 *
 * Complete refactored admin panel with all advanced features:
 * - Optimistic updates with automatic rollback
 * - Undo/Redo functionality with history
 * - Batch operations (multi-select, bulk delete, bulk update)
 * - CSV bulk import with validation
 * - Audit log tracking
 * - Feature flags (role-based UI)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useState, useCallback, memo, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, components } from '../theme';
import type { NavigationProp, RouteFund } from '../types';
import { getErrorMessage } from '../types';
import { ScreenHeader, LoadingScreen, CustomButton } from '../components/ui';
import {
  RoutesList,
  AddRouteForm,
  BatchActions,
  BulkImport,
  AuditLogViewer
} from '../components/admin';
import { logger } from '../utils/logger';
import { transformRouteFundsResponse } from '../utils/apiHelpers';
import {
  useRequireAdmin,
  useUndoRedo,
  useAuditLog,
  useAuth
} from '../hooks';

function AdminFundsScreenEnhanced() {
  const navigation = useNavigation<NavigationProp>();
  const [route, setRoute] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const queryClient = useQueryClient();
  
  // Access control
  const { hasAccess, isChecking } = useRequireAdmin();
  const { getUser } = useAuth();
  const [user, setUser] = useState<any>(null);

  // Load user info
  useEffect(() => {
    getUser().then(setUser);
  }, [getUser]);

  // Undo/Redo functionality
  const { canUndo, canRedo, undo, redo, addToHistory } = useUndoRedo({
    maxHistorySize: 50,
    onUndo: (action) => {
      logger.info('Undoing action:', action.description);
    },
    onRedo: (action) => {
      logger.info('Redoing action:', action.description);
    },
  });

  // Audit logging
  const { logAction, auditLog, exportLog, clearLog } = useAuditLog({
    persistToLocal: true,
    maxLogSize: 1000,
  });

  // Fetch routes
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

  // Create mutation with optimistic update
  const createMut = useMutation({
    mutationFn: (body: { route: string; amount: number }) => {
      // Optimistic update
      const tempId = `temp_${Date.now()}`;
      const optimisticRoute: RouteFund = {
        id: tempId,
        route: body.route,
        amount: body.amount,
      };
      
      queryClient.setQueryData<RouteFund[]>(['adminRouteFunds'], (old = []) => {
        return [...old, optimisticRoute];
      });

      return apiFetch('/steps/admin/route-funds', { 
        method: 'POST', 
        body: JSON.stringify(body) 
      });
    },
    onSuccess: async (data, variables) => { 
      queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
      queryClient.invalidateQueries({ queryKey: ['fundsDistribution'] });
      
      // Log action
      await logAction({
        action: 'create',
        resource: 'route_fund',
        resourceId: data?.id || 'unknown',
        userId: user?.id || 'unknown',
        userName: user?.naam || 'Unknown',
        details: { route: variables.route, amount: variables.amount },
      });

      setRoute(''); 
      setAmount('');
      Alert.alert('Succes', 'Route toegevoegd');
    },
    onError: (error: unknown, variables) => {
      // Rollback optimistic update
      queryClient.setQueryData<RouteFund[]>(['adminRouteFunds'], (old = []) => {
        return old.filter(r => !r.id.startsWith('temp_'));
      });
      
      const message = getErrorMessage(error);
      Alert.alert('Fout', message);
    },
  });

  // Update mutation with optimistic update
  const updateMut = useMutation({
    mutationFn: ({ r, body }: { r: string; body: { amount: number } }) => {
      // Store previous value for undo
      const previousRoute = fundsList?.find(route => route.route === r);
      
      // Optimistic update
      queryClient.setQueryData<RouteFund[]>(['adminRouteFunds'], (old = []) => {
        return old.map(route =>
          route.route === r ? { ...route, amount: body.amount } : route
        );
      });

      return apiFetch(`/steps/admin/route-funds/${encodeURIComponent(r)}`, { 
        method: 'PUT', 
        body:JSON.stringify(body) 
      }).then(result => ({ result, previousRoute, r, body }));
    },
    onSuccess: async ({ previousRoute, r, body }) => {
      queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
      queryClient.invalidateQueries({ queryKey: ['fundsDistribution'] });

      // Add to undo history
      if (previousRoute) {
        addToHistory({
          type: 'update',
          undo: async () => {
            await apiFetch(`/steps/admin/route-funds/${encodeURIComponent(r)}`, {
              method: 'PUT',
              body: JSON.stringify({ amount: previousRoute.amount }),
            });
            queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
          },
          redo: async () => {
            await apiFetch(`/steps/admin/route-funds/${encodeURIComponent(r)}`, {
              method: 'PUT',
              body: JSON.stringify(body),
            });
            queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
          },
          description: `Updated ${r} from €${previousRoute.amount} to €${body.amount}`,
        });
      }

      // Log action
      await logAction({
        action: 'update',
        resource: 'route_fund',
        resourceId: r,
        userId: user?.id || 'unknown',
        userName: user?.naam || 'Unknown',
        previousValue: previousRoute?.amount,
        newValue: body.amount,
      });

      Alert.alert('Succes', 'Route bijgewerkt');
    },
    onError: (error: unknown) => {
      queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
      const message = getErrorMessage(error);
      Alert.alert('Fout', message);
    },
  });

  // Delete mutation with optimistic update
  const deleteMut = useMutation({
    mutationFn: (r: string) => {
      // Store deleted route for undo
      const deletedRoute = fundsList?.find(route => route.route === r);
      
      // Optimistic removal
      queryClient.setQueryData<RouteFund[]>(['adminRouteFunds'], (old = []) => {
        return old.filter(route => route.route !== r);
      });

      return apiFetch(`/steps/admin/route-funds/${encodeURIComponent(r)}`, { 
        method: 'DELETE' 
      }).then(result => ({ result, deletedRoute, r }));
    },
    onSuccess: async ({ deletedRoute, r }) => {
      queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
      queryClient.invalidateQueries({ queryKey: ['fundsDistribution'] });

      // Add to undo history
      if (deletedRoute) {
        addToHistory({
          type: 'delete',
          undo: async () => {
            await apiFetch('/steps/admin/route-funds', {
              method: 'POST',
              body: JSON.stringify({ route: deletedRoute.route, amount: deletedRoute.amount }),
            });
            queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
          },
          redo: async () => {
            await apiFetch(`/steps/admin/route-funds/${encodeURIComponent(r)}`, {
              method: 'DELETE',
            });
            queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
          },
          description: `Deleted route ${r} (€${deletedRoute.amount})`,
        });
      }

      // Log action
      await logAction({
        action: 'delete',
        resource: 'route_fund',
        resourceId: r,
        userId: user?.id || 'unknown',
        userName: user?.naam || 'Unknown',
        previousValue: deletedRoute,
      });

      Alert.alert('Succes', 'Route verwijderd');
    },
    onError: (error: unknown) => {
      queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
      const message = getErrorMessage(error);
      Alert.alert('Fout', message);
    },
  });

  // Handle single route operations
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

  // Batch operations
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (fundsList) {
      setSelectedIds(fundsList.map(r => r.id));
    }
  }, [fundsList]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const handleBatchDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;

    const selectedRoutes = fundsList?.filter(r => selectedIds.includes(r.id)) || [];
    
    Alert.alert(
      'Batch Verwijderen',
      `Verwijder ${selectedIds.length} geselecteerde routes?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all selected routes
              for (const route of selectedRoutes) {
                await apiFetch(`/steps/admin/route-funds/${encodeURIComponent(route.route)}`, {
                  method: 'DELETE',
                });
              }

              // Log batch action
              await logAction({
                action: 'batch_delete',
                resource: 'route_fund',
                userId: user?.id || 'unknown',
                userName: user?.naam || 'Unknown',
                details: { count: selectedIds.length, routes: selectedRoutes.map(r => r.route) },
              });

              queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
              setSelectedIds([]);
              Alert.alert('Succes', `${selectedIds.length} routes verwijderd`);
            } catch (error) {
              Alert.alert('Fout', 'Batch verwijderen mislukt: ' + (error as Error).message);
            }
          },
        },
      ]
    );
  }, [selectedIds, fundsList, logAction, user, queryClient]);

  const handleBatchUpdate = useCallback(async (increment: number) => {
    if (selectedIds.length === 0) return;

    const selectedRoutes = fundsList?.filter(r => selectedIds.includes(r.id)) || [];
    
    try {
      for (const route of selectedRoutes) {
        const newAmount = route.amount + increment;
        if (newAmount >= 0) {
          await apiFetch(`/steps/admin/route-funds/${encodeURIComponent(route.route)}`, {
            method: 'PUT',
            body: JSON.stringify({ amount: newAmount }),
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
      setSelectedIds([]);
      Alert.alert('Succes', `${selectedIds.length} routes bijgewerkt`);
    } catch (error) {
      Alert.alert('Fout', 'Batch update mislukt: ' + (error as Error).message);
    }
  }, [selectedIds, fundsList, queryClient]);

  // Bulk import
  const handleBulkImport = useCallback(async (routes: Omit<RouteFund, 'id'>[]) => {
    try {
      for (const route of routes) {
        await apiFetch('/steps/admin/route-funds', {
          method: 'POST',
          body: JSON.stringify(route),
        });
      }

      // Log import action
      await logAction({
        action: 'import',
        resource: 'route_fund',
        userId: user?.id || 'unknown',
        userName: user?.naam || 'Unknown',
        details: { count: routes.length },
      });

      queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
    } catch (error) {
      throw error;
    }
  }, [logAction, user, queryClient]);

  // Export audit log
  const handleExportLog = useCallback(() => {
    const logData = exportLog();
    Alert.alert(
      'Audit Log Export',
      'Log data gekopieerd naar clipboard (in productie)',
      [{ text: 'OK' }]
    );
    logger.info('Audit log exported:', logData.length, 'characters');
  }, [exportLog]);

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
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader
        title="Route Funds Beheer"
        subtitle="Enhanced met alle admin features"
        gradientColors={[colors.status.warning, '#e67f1c']}
        icon="⚙️"
      />

      {/* Undo/Redo Controls */}
      <View style={styles.undoRedoBar}>
        <CustomButton
          title="↶ Undo"
          onPress={undo}
          variant="ghost"
          size="small"
          disabled={!canUndo}
          style={styles.undoButton}
        />
        <CustomButton
          title="↷ Redo"
          onPress={redo}
          variant="ghost"
          size="small"
          disabled={!canRedo}
          style={styles.undoButton}
        />
        <TouchableOpacity 
          onPress={() => setSelectionMode(!selectionMode)}
          style={styles.selectionToggle}
        >
          <Text style={styles.selectionToggleText}>
            {selectionMode ? '✓ Selectie modus' : '☐ Selectie modus'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Batch Actions */}
      {selectionMode && (
        <BatchActions
          selectedIds={selectedIds}
          allItems={fundsList || []}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onBatchDelete={handleBatchDelete}
          onBatchUpdate={handleBatchUpdate}
          isProcessing={deleteMut.isPending || updateMut.isPending}
        />
      )}

      {/* Routes List */}
      <RoutesList
        routes={fundsList || []}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isUpdating={updateMut.isPending}
        isDeleting={deleteMut.isPending}
        showDebug={false}
        selectable={selectionMode}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
      />

      {/* Add Route Form */}
      <AddRouteForm
        route={route}
        amount={amount}
        onRouteChange={setRoute}
        onAmountChange={setAmount}
        onSubmit={handleCreate}
        isSubmitting={createMut.isPending}
      />

      {/* Bulk Import */}
      <BulkImport
        onImport={handleBulkImport}
        isImporting={createMut.isPending}
      />

      {/* Audit Log Viewer */}
      <AuditLogViewer
        entries={auditLog}
        maxEntries={20}
        onExport={handleExportLog}
        onClear={() => {
          Alert.alert(
            'Audit Log Wissen',
            'Weet je zeker dat je de audit log wilt wissen?',
            [
              { text: 'Annuleren', style: 'cancel' },
              { text: 'Wissen', onPress: clearLog, style: 'destructive' },
            ]
          );
        }}
      />
    </ScrollView>
  );
}

export default memo(AdminFundsScreenEnhanced);

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
  undoRedoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: spacing.sm,
  },
  undoButton: {
    minWidth: 80,
  },
  selectionToggle: {
    marginLeft: 'auto',
    padding: spacing.sm,
  },
  selectionToggleText: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
});