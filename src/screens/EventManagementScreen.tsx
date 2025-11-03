/**
 * EventManagementScreen
 * 
 * Admin screen voor event management:
 * - View alle events (active + inactive)
 * - Toggle event active status (quick action)
 * - View event details (geofences, config)
 * - Delete events
 * 
 * Permissions Required: events:write (admin only)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useEventData } from '../hooks/useEventData';
import { useEventMutations } from '../hooks/useEventMutations';
import Card from '../components/ui/Card';
import CustomButton from '../components/ui/CustomButton';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import LoadingScreen from '../components/ui/LoadingScreen';
import { theme } from '../theme';
import type { EventData, BackendGeofence } from '../types/geofencing';

export default function EventManagementScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch all events
  const { events, isLoading, refetch } = useEventData({
    enabled: true,
    refetchInterval: 0,
  });

  // Mutations
  const { toggleActive, deleteEvent, isLoading: isMutating } = useEventMutations();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleToggleActive = (event: EventData) => {
    const newState = !event.is_active;
    toggleActive.mutate({
      eventId: event.id,
      isActive: newState,
    }, {
      onSuccess: () => {
        Alert.alert(
          'Status Updated',
          `Event "${event.name}" is nu ${newState ? 'actief' : 'inactief'}`,
          [{ text: 'OK' }]
        );
      },
    });
  };

  const handleDelete = (event: EventData) => {
    Alert.alert(
      'Event Verwijderen?',
      `Wil je "${event.name}" permanent verwijderen?\n\nDit kan niet ongedaan worden.`,
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: () => {
            deleteEvent.mutate(event.id, {
              onSuccess: () => {
                Alert.alert('Verwijderd', `Event "${event.name}" is verwijderd`);
              },
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingScreen message="Events laden..." />;
  }

  if (events.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="📅"
          title="Geen Events"
          description="Er zijn nog geen events. Maak je eerste event aan via de backend API."
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Event Management</Text>
          <Text style={styles.headerSubtitle}>
            {events.length} event{events.length !== 1 ? 's' : ''} totaal
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        {events.map((event) => (
          <EventListCard
            key={event.id}
            event={event}
            onToggleActive={() => handleToggleActive(event)}
            onDelete={() => handleDelete(event)}
            isUpdating={isMutating}
          />
        ))}
      </View>

      <View style={styles.refreshHint}>
        <Text style={styles.refreshHintText}>
          ↓ Trek naar beneden om te vernieuwen
        </Text>
      </View>
    </ScrollView>
  );
}

interface EventListCardProps {
  event: EventData;
  onToggleActive: () => void;
  onDelete: () => void;
  isUpdating: boolean;
}

function EventListCard({ event, onToggleActive, onDelete, isUpdating }: EventListCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusVariant = (): 'success' | 'warning' | 'neutral' | 'danger' => {
    if (!event.is_active) return 'neutral';
    if (event.status === 'active') return 'success';
    if (event.status === 'upcoming') return 'warning';
    if (event.status === 'completed') return 'neutral';
    return 'danger';
  };

  return (
    <Card style={styles.eventCard}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.eventHeader}>
          <View style={styles.eventTitleRow}>
            <Text style={styles.eventName} numberOfLines={1}>
              {event.name}
            </Text>
            <Badge
              label={event.status.toUpperCase()}
              variant={getStatusVariant()}
              size="small"
            />
          </View>
          
          <View style={styles.eventMetaRow}>
            <Text style={styles.eventMeta}>
              📍 {event.geofences?.length ?? 0} geofences
            </Text>
            <Text style={styles.eventMeta}>
              📅 {formatDate(event.start_time)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.eventDetails}>
          {event.description && (
            <Text style={styles.eventDescription}>{event.description}</Text>
          )}

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Geofences:</Text>
            {event.geofences && event.geofences.length > 0 ? (
              event.geofences.map((fence: BackendGeofence, index: number) => (
                <View key={index} style={styles.geofenceRow}>
                  <Badge 
                    label={fence.type.toUpperCase()} 
                    variant={fence.type === 'start' ? 'success' : 'neutral'}
                    size="small"
                  />
                  <Text style={styles.geofenceText}>
                    {fence.name || `${fence.type} geofence`}
                  </Text>
                  <Text style={styles.geofenceRadius}>{fence.radius}m</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noData}>Geen geofences</Text>
            )}
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Tijden:</Text>
            <Text style={styles.detailText}>Start: {formatDate(event.start_time)}</Text>
            {event.end_time && (
              <Text style={styles.detailText}>Eind: {formatDate(event.end_time)}</Text>
            )}
          </View>

          <View style={styles.actions}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>
                {event.is_active ? 'Actief' : 'Inactief'}
              </Text>
              <Switch
                value={event.is_active}
                onValueChange={onToggleActive}
                disabled={isUpdating}
                trackColor={{ false: theme.colors.background.gray200, true: theme.colors.status.success }}
              />
            </View>

            <View style={styles.actionButtons}>
              <CustomButton
                title="Verwijderen"
                onPress={onDelete}
                variant="danger"
                size="small"
                fullWidth
              />
            </View>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.subtle,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  section: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  eventCard: {
    padding: 0,
    overflow: 'hidden',
  },
  eventHeader: {
    padding: theme.spacing.lg,
  },
  eventTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  eventName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginRight: theme.spacing.sm,
  },
  eventMetaRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  eventMeta: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  eventDetails: {
    padding: theme.spacing.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  eventDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  detailSection: {
    marginBottom: theme.spacing.md,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  noData: {
    fontSize: 14,
    color: theme.colors.text.disabled,
    fontStyle: 'italic',
  },
  geofenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  geofenceText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  geofenceRadius: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  actions: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.gray100,
    borderRadius: theme.spacing.radius.md,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  refreshHint: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  refreshHintText: {
    fontSize: 12,
    color: theme.colors.text.disabled,
  },
});