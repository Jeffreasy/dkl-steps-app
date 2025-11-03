/**
 * BulkImport Component
 * 
 * Provides CSV file upload and parsing for bulk route import.
 * Validates data before import and shows preview.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { colors, typography, spacing, components } from '../../theme';
import { CustomButton } from '../ui';
import type { RouteFund } from '../../types';

interface BulkImportProps {
  onImport: (routes: Omit<RouteFund, 'id'>[]) => Promise<void>;
  isImporting?: boolean;
}

interface ParsedRoute {
  route: string;
  amount: number;
  isValid: boolean;
  error?: string;
}

export function BulkImport({ onImport, isImporting = false }: BulkImportProps) {
  const [parsedRoutes, setParsedRoutes] = useState<ParsedRoute[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  /**
   * Parse CSV content
   */
  const parseCSV = (content: string): ParsedRoute[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const routes: ParsedRoute[] = [];

    // Skip header if present
    const startIndex = lines[0]?.toLowerCase().includes('route') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map(p => p.trim());
      
      if (parts.length < 2) {
        routes.push({
          route: line,
          amount: 0,
          isValid: false,
          error: 'Onvoldoende kolommen (verwacht: route,bedrag)',
        });
        continue;
      }

      const [route, amountStr] = parts;
      const amount = parseInt(amountStr);

      if (!route) {
        routes.push({
          route: '',
          amount: 0,
          isValid: false,
          error: 'Route naam is leeg',
        });
        continue;
      }

      if (isNaN(amount) || amount < 0) {
        routes.push({
          route,
          amount: 0,
          isValid: false,
          error: 'Ongeldig bedrag',
        });
        continue;
      }

      routes.push({
        route,
        amount,
        isValid: true,
      });
    }

    return routes;
  };

  /**
   * Handle file selection
   */
  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        Alert.alert('Fout', 'Geen bestand geselecteerd');
        return;
      }

      const file = result.assets[0];
      
      // Read file content
      const response = await fetch(file.uri);
      const content = await response.text();

      // Parse CSV
      const parsed = parseCSV(content);
      setParsedRoutes(parsed);
      setShowPreview(true);

      const validCount = parsed.filter(r => r.isValid).length;
      const invalidCount = parsed.length - validCount;

      Alert.alert(
        'Bestand Gelezen',
        `${validCount} geldige routes gevonden${invalidCount > 0 ? `, ${invalidCount} ongeldige` : ''}`,
      );
    } catch (error) {
      Alert.alert('Fout', 'Kan bestand niet lezen: ' + (error as Error).message);
    }
  };

  /**
   * Handle import
   */
  const handleImport = async () => {
    const validRoutes = parsedRoutes.filter(r => r.isValid);
    
    if (validRoutes.length === 0) {
      Alert.alert('Fout', 'Geen geldige routes om te importeren');
      return;
    }

    Alert.alert(
      'Bevestigen',
      `Importeer ${validRoutes.length} routes?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Importeren',
          onPress: async () => {
            try {
              await onImport(validRoutes as Omit<RouteFund, 'id'>[]);
              setParsedRoutes([]);
              setShowPreview(false);
              Alert.alert('Succes', `${validRoutes.length} routes geïmporteerd`);
            } catch (error) {
              Alert.alert('Fout', 'Import mislukt: ' + (error as Error).message);
            }
          },
        },
      ]
    );
  };

  /**
   * Download CSV template
   */
  const downloadTemplate = () => {
    const template = 'route,bedrag\n5 KM,100\n10 KM,200\n15 KM,300';
    Alert.alert(
      'CSV Template',
      'Formaat:\nroute,bedrag\n\nVoorbeeld:\n' + template,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bulk Import (CSV)</Text>
      
      <View style={styles.buttonRow}>
        <CustomButton
          title="📁 Selecteer CSV"
          onPress={handleSelectFile}
          variant="outline"
          size="small"
          style={styles.button}
          disabled={isImporting}
        />
        <CustomButton
          title="📄 Template"
          onPress={downloadTemplate}
          variant="ghost"
          size="small"
          style={styles.button}
        />
      </View>

      {showPreview && parsedRoutes.length > 0 && (
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Preview ({parsedRoutes.length} routes)</Text>
          <ScrollView style={styles.previewScroll} nestedScrollEnabled>
            {parsedRoutes.slice(0, 10).map((route, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.previewItem,
                  !route.isValid && styles.previewItemInvalid,
                ]}
              >
                <Text style={styles.previewRoute}>{route.route || '(leeg)'}</Text>
                <Text style={styles.previewAmount}>€{route.amount}</Text>
                {!route.isValid && (
                  <Text style={styles.previewError}>{route.error}</Text>
                )}
              </View>
            ))}
            {parsedRoutes.length > 10 && (
              <Text style={styles.previewMore}>
                ... en {parsedRoutes.length - 10} meer
              </Text>
            )}
          </ScrollView>

          <CustomButton
            title={`Importeer ${parsedRoutes.filter(r => r.isValid).length} routes`}
            onPress={handleImport}
            variant="primary"
            size="medium"
            disabled={isImporting || parsedRoutes.filter(r => r.isValid).length === 0}
            style={styles.importButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...components.card.elevated,
    margin: spacing.lg,
    marginTop: spacing.xl,
    borderTopWidth: 3,
    borderTopColor: colors.secondary,
  },
  title: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
  preview: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.background.gray50,
    borderRadius: spacing.radius.md,
  },
  previewTitle: {
    ...typography.styles.h6,
    fontFamily: typography.fonts.headingBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  previewScroll: {
    maxHeight: 200,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  previewItemInvalid: {
    backgroundColor: `${colors.status.error}10`,
  },
  previewRoute: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.primary,
    flex: 1,
  },
  previewAmount: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  previewError: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.status.error,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  previewMore: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  importButton: {
    marginTop: spacing.md,
  },
});